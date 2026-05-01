const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "mod-handler",
  description: "30+ moderation commands system",

  run: async (client, msg, args) => {
    if (!msg.content.startsWith("+")) return;

    const cmd = msg.content.split(" ")[0].slice(1).toLowerCase();
    const member = msg.mentions.members.first();

    // ================= BASIC MOD =================

    if (cmd === "kick") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return msg.reply("❌ No permission");
      if (!member) return msg.reply("Mention user");
      await member.kick();
      return msg.reply("👢 Kicked");
    }

    if (cmd === "ban") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return msg.reply("❌ No permission");
      if (!member) return msg.reply("Mention user");
      await member.ban();
      return msg.reply("🚫 Banned");
    }

    if (cmd === "unban") {
      const id = args[0];
      if (!id) return msg.reply("Provide ID");
      await msg.guild.members.unban(id);
      return msg.reply("♻️ Unbanned");
    }

    if (cmd === "timeout") {
      if (!member) return msg.reply("Mention user");
      await member.timeout(10 * 60 * 1000);
      return msg.reply("⏳ Timed out");
    }

    if (cmd === "untimeout") {
      if (!member) return msg.reply("Mention user");
      await member.timeout(null);
      return msg.reply("🔊 Removed timeout");
    }

    // ================= ROLE COMMANDS =================

    if (cmd === "addrole") {
      const role = msg.mentions.roles.first();
      if (!member || !role) return msg.reply("Usage: .addrole @user @role");
      await member.roles.add(role);
      return msg.reply("➕ Role added");
    }

    if (cmd === "removerole") {
      const role = msg.mentions.roles.first();
      if (!member || !role) return msg.reply("Usage: .removerole @user @role");
      await member.roles.remove(role);
      return msg.reply("➖ Role removed");
    }

    if (cmd === "roleall") {
      const role = msg.mentions.roles.first();
      if (!role) return msg.reply("Mention role");
      msg.guild.members.cache.forEach(m => m.roles.add(role));
      return msg.reply("👥 Role given to all");
    }

    // ================= CHANNEL CONTROL =================

    if (cmd === "lock") {
      msg.channel.permissionOverwrites.edit(msg.guild.id, {
        SendMessages: false
      });
      return msg.reply("🔒 Locked");
    }

    if (cmd === "unlock") {
      msg.channel.permissionOverwrites.edit(msg.guild.id, {
        SendMessages: true
      });
      return msg.reply("🔓 Unlocked");
    }

    if (cmd === "hide") {
      msg.channel.permissionOverwrites.edit(msg.guild.id, {
        ViewChannel: false
      });
      return msg.reply("🙈 Hidden");
    }

    if (cmd === "unhide") {
      msg.channel.permissionOverwrites.edit(msg.guild.id, {
        ViewChannel: true
      });
      return msg.reply("👁️ Visible");
    }

    if (cmd === "slowmode") {
      const time = parseInt(args[0]);
      if (!time) return msg.reply("Provide seconds");
      msg.channel.setRateLimitPerUser(time);
      return msg.reply("🐢 Slowmode set");
    }

    if (cmd === "clear") {
      const amount = parseInt(args[0]);
      if (!amount) return msg.reply("Provide number");
      await msg.channel.bulkDelete(amount);
      return msg.reply("🧹 Cleared");
    }

    // ================= USER CONTROL =================

    if (cmd === "nickname") {
      if (!member) return msg.reply("Mention user");
      const name = args.slice(1).join(" ");
      await member.setNickname(name);
      return msg.reply("✏️ Nickname changed");
    }

    if (cmd === "deafen") {
      if (!member) return msg.reply("Mention user");
      await member.voice.setDeaf(true);
      return msg.reply("🔇 Deafened");
    }

    if (cmd === "undeafen") {
      if (!member) return msg.reply("Mention user");
      await member.voice.setDeaf(false);
      return msg.reply("🔊 Undeafened");
    }

    if (cmd === "move") {
      const channel = msg.mentions.channels.first();
      if (!member || !channel) return msg.reply("Usage: .move @user #channel");
      await member.voice.setChannel(channel);
      return msg.reply("🚀 Moved");
    }

    // ================= WARN SYSTEM =================

    if (cmd === "warn") {
      return msg.reply("⚠️ Warn system (DB needed)");
    }

    if (cmd === "unwarn") {
      return msg.reply("♻️ Unwarn system (DB needed)");
    }

    // ================= SERVER CONTROL =================

    if (cmd === "nuke") {
      const clone = await msg.channel.clone();
      await msg.channel.delete();
      clone.send("💥 Channel nuked");
      return;
    }

    if (cmd === "renamechannel") {
      const name = args.join(" ");
      if (!name) return msg.reply("Provide name");
      msg.channel.setName(name);
      return msg.reply("✏️ Renamed");
    }

    // ================= SECURITY =================

    if (cmd === "softban") {
      if (!member) return msg.reply("Mention user");
      await member.ban({ deleteMessageSeconds: 604800 });
      await msg.guild.members.unban(member.id);
      return msg.reply("⚡ Softbanned");
    }

    if (cmd === "jail") {
      if (!member) return msg.reply("Mention user");
      let role = msg.guild.roles.cache.find(r => r.name === "Jailed");
      if (!role) role = await msg.guild.roles.create({ name: "Jailed" });
      await member.roles.set([role]);
      return msg.reply("🔒 Jailed");
    }

    if (cmd === "unjail") {
      if (!member) return msg.reply("Mention user");
      await member.roles.set([]);
      return msg.reply("🔓 Unjailed");
    }

    // ================= EXTRA POWER =================

    if (cmd === "purgeuser") {
      const user = msg.mentions.users.first();
      if (!user) return msg.reply("Mention user");

      let messages = await msg.channel.messages.fetch();
      messages = messages.filter(m => m.author.id === user.id);

      await msg.channel.bulkDelete(messages);
      return msg.reply("🧼 User messages cleared");
    }

    if (cmd === "forceban") {
      const id = args[0];
      if (!id) return msg.reply("Provide ID");
      await msg.guild.members.ban(id);
      return msg.reply("🚫 Force banned");
    }

    if (cmd === "antispam") {
      return msg.reply("🛡 Anti-spam system toggle (DB needed)");
    }

    if (cmd === "logs") {
      return msg.reply("📜 Logs system (setup needed)");
    }

    if (cmd === "setprefix") {
      return msg.reply("⚙️ Prefix system (handler needed)");
    }

    // ================= END =================

    if (cmd === "modhelp") {
      return msg.reply(`
🛡 MOD COMMANDS

kick, ban, unban, timeout, untimeout,
addrole, removerole, roleall,
lock, unlock, hide, unhide, slowmode, clear,
nickname, deafen, undeafen, move,
warn, unwarn, nuke, renamechannel,
softban, jail, unjail, purgeuser,
forceban, antispam, logs, setprefix
      `);
    }
  }
};
