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

// ================= ECONOMY SYSTEM =================
const ecoFile = "./eco.json";
let eco = fs.existsSync(ecoFile)
  ? JSON.parse(fs.readFileSync(ecoFile))
  : {};

function saveEco() {
  fs.writeFileSync(ecoFile, JSON.stringify(eco, null, 2));
}

function getUser(id) {
  if (!eco[id]) {
    eco[id] = { wallet: 0, bank: 0, daily: 0 };
  }
  return eco[id];
}

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

  // ================= PING =================
  if (cmd === "ping") {
    return msg.reply(`🏓 Pong: ${client.ws.ping}ms`);
  }

  // ================= HELP BUTTONS =================
  if (cmd === "help") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_mod").setLabel("🛡 Moderation").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_eco").setLabel("💰 Economy").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("help_ticket").setLabel("🎫 Tickets").setStyle(ButtonStyle.Secondary)
    );

    return msg.reply({ content: "📌 Select a category:", components: [row] });
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
      embeds: [new EmbedBuilder().setTitle("🎫 Support System").setColor("Blue")],
      components: [row]
    });
  }

  // ================= GIVEAWAY =================
  if (cmd === "giveaway") {
    const time = parseInt(args[0]) * 1000;
    const prize = args.slice(1).join(" ");

    if (!time || !prize) return msg.reply("Usage: +giveaway 10 Nitro");

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

      if (!users.length)
        return msg.channel.send("❌ No participants");

      const winner = users[Math.floor(Math.random() * users.length)];
      msg.channel.send(`🏆 Winner: <@${winner}> | Prize: **${prize}**`);
    }, time);
  }

  // ================= 💰 ECONOMY COMMANDS =================

  if (cmd === "bal") {
    const user = getUser(msg.author.id);
    return msg.reply(`💰 Wallet: $${user.wallet}\n🏦 Bank: $${user.bank}`);
  }

  if (cmd === "daily") {
    const user = getUser(msg.author.id);
    const now = Date.now();

    if (now - user.daily < 86400000)
      return msg.reply("⏳ Already claimed daily");

    user.wallet += 1000;
    user.daily = now;
    saveEco();

    return msg.reply("🎁 You got $1000 daily!");
  }

  if (cmd === "work") {
    const user = getUser(msg.author.id);
    const earn = Math.floor(Math.random() * 500) + 100;

    user.wallet += earn;
    saveEco();

    return msg.reply(`💼 You earned $${earn}`);
  }

  if (cmd === "beg") {
    const user = getUser(msg.author.id);
    const money = Math.floor(Math.random() * 200);

    user.wallet += money;
    saveEco();

    return msg.reply(`🙏 Someone gave you $${money}`);
  }

  if (cmd === "rob") {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("Mention user");

    const u = getUser(msg.author.id);
    const v = getUser(target.id);

    if (v.wallet < 200)
      return msg.reply("❌ Too poor");

    const steal = Math.floor(Math.random() * v.wallet);

    v.wallet -= steal;
    u.wallet += steal;

    saveEco();

    return msg.reply(`💀 Robbed $${steal} from ${target.username}`);
  }

  if (cmd === "pay") {
    const target = msg.mentions.users.first();
    const amt = parseInt(args[1]);

    if (!target || !amt)
      return msg.reply("Usage: +pay @user 500");

    const u = getUser(msg.author.id);
    const r = getUser(target.id);

    if (u.wallet < amt)
      return msg.reply("❌ Not enough money");

    u.wallet -= amt;
    r.wallet += amt;

    saveEco();
    return msg.reply(`💸 Paid $${amt}`);
  }

  if (cmd === "deposit") {
    const user = getUser(msg.author.id);
    const amt = parseInt(args[0]);

    if (!amt || amt > user.wallet)
      return msg.reply("❌ Invalid amount");

    user.wallet -= amt;
    user.bank += amt;

    saveEco();
    return msg.reply(`🏦 Deposited $${amt}`);
  }

  if (cmd === "withdraw") {
    const user = getUser(msg.author.id);
    const amt = parseInt(args[0]);

    if (!amt || amt > user.bank)
      return msg.reply("❌ Invalid amount");

    user.bank -= amt;
    user.wallet += amt;

    saveEco();
    return msg.reply(`💸 Withdrawn $${amt}`);
  }

  if (cmd === "slot") {
    const user = getUser(msg.author.id);

    const s = ["🍒","🍋","🍉","💎"];
    const a = s[Math.floor(Math.random()*s.length)];
    const b = s[Math.floor(Math.random()*s.length)];
    const c = s[Math.floor(Math.random()*s.length)];

    if (a === b && b === c) {
      user.wallet += 1000;
      saveEco();
      return msg.reply(`🎰 ${a}${b}${c} JACKPOT +$1000`);
    }

    return msg.reply(`🎰 ${a}${b}${c} Lost`);
  }

  if (cmd === "leaderboard") {
    const top = Object.entries(eco)
      .sort((a,b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank))
      .slice(0, 10);

    const text = top.map((u,i)=>
      `#${i+1} <@${u[0]}> - $${u[1].wallet + u[1].bank}`
    ).join("\n");

    return msg.reply("🏆 Leaderboard\n" + text);
  }

  if (cmd === "addmoney") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return msg.reply("❌ Admin only command");

  const user = msg.mentions.users.first();
  const amount = parseInt(args[1]);

  if (!user || !amount) return msg.reply("Usage: +addmoney @user 1000");

  const u = getUser(user.id);
  u.wallet += amount;

  saveEco();
  return msg.reply(`➕ Added $${amount} to ${user.username}`);
}
  // ================= 40+ MOD SYSTEM =================
  if (cmd === "mod") {
  const mcmd = args.shift()?.toLowerCase();
  const isAdmin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (!isAdmin) return msg.reply("❌ Admin only command");

  const target = msg.mentions.members.first();

  // ================= BASIC ACTIONS =================
  if (mcmd === "kick") {
    if (!target) return msg.reply("Mention user");
    await target.kick();
    return msg.reply("👢 Kicked user");
  }

  if (mcmd === "ban") {
    if (!target) return msg.reply("Mention user");
    await target.ban();
    return msg.reply("🔨 Banned user");
  }

  if (mcmd === "unban") {
    const id = args[0];
    if (!id) return msg.reply("User ID required");
    await msg.guild.members.unban(id);
    return msg.reply("✅ Unbanned user");
  }

  if (mcmd === "timeout") {
    if (!target) return msg.reply("Mention user");
    await target.timeout(60_000);
    return msg.reply("⏳ Timed out");
  }

  if (mcmd === "untimeout") {
    if (!target) return msg.reply("Mention user");
    await target.timeout(null);
    return msg.reply("♻️ Timeout removed");
  }

  // ================= MESSAGE CONTROL =================
  if (mcmd === "clear") {
    const amount = parseInt(args[0]) || 10;
    await msg.channel.bulkDelete(amount);
    return msg.reply(`🧹 Deleted ${amount} messages`);
  }

  if (mcmd === "nuke") {
    const clone = await msg.channel.clone();
    await msg.channel.delete();
    clone.send("💥 Channel nuked");
  }

  if (mcmd === "slowmode") {
    const time = parseInt(args[0]);
    msg.channel.setRateLimitPerUser(time);
    return msg.reply(`🐢 Slowmode set to ${time}s`);
  }

  if (mcmd === "lock") {
    await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, {
      SendMessages: false
    });
    return msg.reply("🔒 Channel locked");
  }

  if (mcmd === "unlock") {
    await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, {
      SendMessages: true
    });
    return msg.reply("🔓 Channel unlocked");
  }

  // ================= ROLE CONTROL =================
  if (mcmd === "addrole") {
    const role = msg.mentions.roles.first();
    if (!target || !role) return msg.reply("Mention user + role");
    await target.roles.add(role);
    return msg.reply("➕ Role added");
  }

  if (mcmd === "removerole") {
    const role = msg.mentions.roles.first();
    if (!target || !role) return msg.reply("Mention user + role");
    await target.roles.remove(role);
    return msg.reply("➖ Role removed");
  }

  if (mcmd === "nick") {
    if (!target) return msg.reply("Mention user");
    await target.setNickname(args.join(" "));
    return msg.reply("✏️ Nickname changed");
  }

  if (mcmd === "resetnick") {
    if (!target) return msg.reply("Mention user");
    await target.setNickname(null);
    return msg.reply("♻️ Nick reset");
  }

  // ================= VOICE CONTROL =================
  if (mcmd === "voicemute") {
    if (!target) return msg.reply("Mention user");
    await target.voice.setMute(true);
    return msg.reply("🔇 Voice muted");
  }

  if (mcmd === "voiceunmute") {
    if (!target) return msg.reply("Mention user");
    await target.voice.setMute(false);
    return msg.reply("🔊 Voice unmuted");
  }

  if (mcmd === "deafen") {
    if (!target) return msg.reply("Mention user");
    await target.voice.setDeaf(true);
    return msg.reply("🔇 Deafened");
  }

  if (mcmd === "undeafen") {
    if (!target) return msg.reply("Mention user");
    await target.voice.setDeaf(false);
    return msg.reply("🔊 Undeafened");
  }

  if (mcmd === "disconnect") {
    if (!target) return msg.reply("Mention user");
    await target.voice.disconnect();
    return msg.reply("📴 Disconnected from voice");
  }

  // ================= CHANNEL MANAGEMENT =================
  if (mcmd === "lockall") {
    msg.guild.channels.cache.forEach(c => {
      c.permissionOverwrites.edit(msg.guild.roles.everyone, {
        SendMessages: false
      });
    });
    return msg.reply("🔒 All channels locked");
  }

  if (mcmd === "unlockall") {
    msg.guild.channels.cache.forEach(c => {
      c.permissionOverwrites.edit(msg.guild.roles.everyone, {
        SendMessages: true
      });
    });
    return msg.reply("🔓 All channels unlocked");
  }

  if (mcmd === "hide") {
    msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, {
      ViewChannel: false
    });
    return msg.reply("🙈 Channel hidden");
  }

  if (mcmd === "unhide") {
    msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, {
      ViewChannel: true
    });
    return msg.reply("👀 Channel visible");
  }

  // ================= MASS ACTIONS =================
  if (mcmd === "massban") {
    const users = msg.mentions.members;
    users.forEach(async u => await u.ban());
    return msg.reply("💀 Massban executed");
  }

  if (mcmd === "masskick") {
    const users = msg.mentions.members;
    users.forEach(async u => await u.kick());
    return msg.reply("👢 Masskick executed");
  }

  if (mcmd === "prune") {
    const count = parseInt(args[0]) || 10;
    await msg.channel.bulkDelete(count);
    return msg.reply("🧹 Pruned messages");
  }

  // ================= INFO / UTILITY =================
  if (mcmd === "roleinfo") {
    const role = msg.mentions.roles.first();
    if (!role) return msg.reply("Mention role");
    return msg.reply(`ℹ️ Role: ${role.name} | Members: ${role.members.size}`);
  }

  if (mcmd === "warnings") {
    return msg.reply("📄 Warning system not connected (needs DB)");
  }

  if (mcmd === "clearwarns") {
    return msg.reply("♻️ Warnings cleared (system needed)");
  }

  if (mcmd === "serverlock") {
    msg.guild.channels.cache.forEach(c => {
      c.permissionOverwrites.edit(msg.guild.roles.everyone, {
        SendMessages: false,
        ViewChannel: true
      });
    });
    return msg.reply("🔐 Server locked");
  }

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
    return i.reply({ content: "🛡 Mod help", ephemeral: true });

  if (i.customId === "help_eco")
    return i.reply({ content: "💰 Eco help", ephemeral: true });

  if (i.customId === "help_ticket")
    return i.reply({ content: "🎫 Ticket help", ephemeral: true });
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
