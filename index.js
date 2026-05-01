const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: Object.values(GatewayIntentBits)
});

const PREFIX = "+";
const WELCOME_CHANNEL = "123456789012345678";

// ================= ACTIVE GIVEAWAYS =================
const activeGiveaways = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= WELCOME =================
client.on("guildMemberAdd", (member) => {
  const ch =
    member.guild.channels.cache.get(WELCOME_CHANNEL) ||
    member.guild.systemChannel ||
    member.guild.channels.cache.find(c => c.isTextBased());

  if (!ch) return;

  ch.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("🎉 Welcome to the Server!")
        .setDescription(
          `👋 Hey ${member}!\n\n` +
          `Welcome to **${member.guild.name}** 💙\n` +
          `📌 Member #${member.guild.memberCount}`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor("Green")
    ]
  });
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  const member = msg.mentions.members.first();

  // ================= LOADED FILE COMMANDS =================
  const command = client.commands.get(cmd);
  if (command) {
    try {
      return command.execute(client, msg, args, member, PermissionsBitField);
    } catch (err) {
      console.error(err);
      return msg.reply("❌ Error running command");
    }
  }

  // ================= PING =================
  if (cmd === "ping") {
    return msg.reply(`🏓 Pong: ${client.ws.ping}ms`);
  }

  // ================= HELP BUTTONS =================
  if (cmd === "help") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_mod")
        .setLabel("🛡 Moderation")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("help_eco")
        .setLabel("💰 Economy")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("help_ticket")
        .setLabel("🎫 Tickets")
        .setStyle(ButtonStyle.Secondary)
    );

    return msg.reply({
      content: "📌 Select a category:",
      components: [row]
    });
  }

  // ================= TICKET =================
  if (cmd === "ticket") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("🎫 Open Ticket")
        .setStyle(ButtonStyle.Success)
    );

    return msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Support System")
          .setColor("Blue")
      ],
      components: [row]
    });
  }

  // ================= GIVEAWAY =================
  if (cmd === "giveaway") {
    const time = parseInt(args[0]) * 1000;
    const prize = args.slice(1).join(" ");

    if (!time || !prize)
      return msg.reply("Usage: +giveaway 10 Nitro");

    const gmsg = await msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎉 GIVEAWAY")
          .setDescription(`Prize: **${prize}**\nReact 🎉`)
          .setColor("Gold")
      ]
    });

    await gmsg.react("🎉");
    activeGiveaways.set(gmsg.id, true);

    setTimeout(async () => {
      if (!activeGiveaways.get(gmsg.id)) return;

      const reaction = gmsg.reactions.cache.get("🎉");
      if (!reaction) return;

      const users = (await reaction.users.fetch())
        .filter(u => !u.bot)
        .map(u => u.id);

      if (users.length === 0)
        return msg.channel.send("❌ No participants");

      const winner =
        users[Math.floor(Math.random() * users.length)];

      msg.channel.send(`🏆 Winner: <@${winner}> | Prize: **${prize}**`);
    }, time);
  }

  // ================= 40+ MOD COMMANDS (INSIDE INDEX) =================
  if (cmd === "mod") {
    const mcmd = args.shift()?.toLowerCase();
    const isAdmin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isAdmin) return msg.reply("❌ Admin only");

    if (!member && ["kick","ban","timeout","voicemute","voiceunmute","deafen","undeafen","addrole","removerole","nick"].includes(mcmd))
      return msg.reply("❌ Mention user");

    // BASIC MOD
    if (mcmd === "kick") return member.kick().then(() => msg.reply("👢 Kicked"));
    if (mcmd === "ban") return member.ban().then(() => msg.reply("🔨 Banned"));
    if (mcmd === "unban") {
      const id = args[0];
      return msg.guild.members.unban(id).then(() => msg.reply("✅ Unbanned"));
    }

    if (mcmd === "timeout") return member.timeout(60000).then(() => msg.reply("⏳ Timed out"));
    if (mcmd === "untimeout") return member.timeout(null).then(() => msg.reply("♻️ Timeout removed"));

    if (mcmd === "voicemute") return member.voice.setMute(true).then(() => msg.reply("🔇 Muted"));
    if (mcmd === "voiceunmute") return member.voice.setMute(false).then(() => msg.reply("🔊 Unmuted"));

    if (mcmd === "deafen") return member.voice.setDeaf(true).then(() => msg.reply("🔇 Deafened"));
    if (mcmd === "undeafen") return member.voice.setDeaf(false).then(() => msg.reply("🔊 Undeafened"));

    if (mcmd === "clear") {
      const amt = parseInt(args[0]) || 10;
      return msg.channel.bulkDelete(amt).then(() => msg.reply(`🧹 Deleted ${amt}`));
    }

    if (mcmd === "nuke") {
      msg.channel.clone().then(c => {
        msg.channel.delete();
        c.send("💥 Nuked");
      });
    }

    if (mcmd === "lock") {
      msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: false });
      return msg.reply("🔒 Locked");
    }

    if (mcmd === "unlock") {
      msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: true });
      return msg.reply("🔓 Unlocked");
    }

    if (mcmd === "addrole") return member.roles.add(msg.mentions.roles.first());
    if (mcmd === "removerole") return member.roles.remove(msg.mentions.roles.first());
    if (mcmd === "nick") return member.setNickname(args.join(" "));

    // EXTRA PLACEHOLDER COMMANDS (from your 40+ system)
    const placeholders = [
      "lockall","unlockall","hide","unhide","purge","softban","hackban",
      "mute","unmute","clearwarns","warnings","move","disconnect",
      "massban","prune","roleinfo","serverlock"
    ];

    if (placeholders.includes(mcmd))
      return msg.reply(`⚠️ ${mcmd} system placeholder`);

    return msg.reply("❌ Unknown mod command");
  }
});

// ================= BUTTONS =================
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  if (i.customId === "ticket_create") {
    const ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    ch.send("🎫 Support will be here soon!");
    return i.reply({ content: "Ticket created!", ephemeral: true });
  }

  if (i.customId === "help_mod")
    return i.reply({ content: "🛡 Moderation help loaded", ephemeral: true });

  if (i.customId === "help_eco")
    return i.reply({ content: "💰 Economy help loaded", ephemeral: true });

  if (i.customId === "help_ticket")
    return i.reply({ content: "🎫 Ticket system help", ephemeral: true });
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
