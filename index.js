const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ActivityType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= CONFIG =================
const PREFIX = ".";
const OWNER_ID = "1363540480662704248";
const WELCOME_CHANNEL_ID = "123456789012345678";

// ================= DATABASE (NO MONGO) =================
const eco = new Map();
const warns = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= ECONOMY =================
function getEco(id) {
  return eco.get(id) || { cash: 0 };
}
function setEco(id, data) {
  eco.set(id, data);
}

// ================= WELCOME =================
client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Welcome to the Server!")
    .setDescription(`${member} joined **${member.guild.name}**`)
    .setColor("Green")
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "👥 Members", value: `${member.guild.memberCount}`, inline: true }
    );

  ch.send({ embeds: [embed] });
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  let user = getEco(msg.author.id);

  // ================= ECONOMY =================
  if (cmd === "bal") return msg.reply(`💰 Cash: ${user.cash}`);

  if (cmd === "daily") {
    user.cash += 500;
    setEco(msg.author.id, user);
    return msg.reply("💸 Daily claimed!");
  }

  if (cmd === "work") {
    let earn = Math.floor(Math.random() * 1000);
    user.cash += earn;
    setEco(msg.author.id, user);
    return msg.reply(`💼 Earned ${earn}`);
  }

  // ================= FUN =================
  if (cmd === "ping") return msg.reply(`🏓 ${client.ws.ping}ms`);

  if (cmd === "roll") {
    return msg.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
  }

  // ================= USER INFO =================
  if (cmd === "userinfo") {
    const member = msg.mentions.members.first() || msg.member;

    const embed = new EmbedBuilder()
      .setTitle("👤 User Info")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Name", value: member.user.username },
        { name: "ID", value: member.id },
        { name: "Joined", value: member.joinedAt.toDateString() }
      );

    return msg.reply({ embeds: [embed] });
  }

  // ================= SERVER INFO =================
  if (cmd === "serverinfo") {
    const g = msg.guild;

    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏠 Server Info")
          .addFields(
            { name: "Name", value: g.name },
            { name: "Members", value: `${g.memberCount}` }
          )
      ]
    });
  }

  // ================= WARN SYSTEM =================
  if (cmd === "warn") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return msg.reply("No permission");

    const user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");

    let data = warns.get(user.id) || 0;
    warns.set(user.id, data + 1);

    return msg.reply(`⚠️ Warned ${user.user.username} (${data + 1})`);
  }

  // ================= MODERATION (40+ STYLE CORE) =================

  if (cmd === "kick") {
    const u = msg.mentions.members.first();
    if (!u) return;
    await u.kick();
    msg.reply("👢 Kicked");
  }

  if (cmd === "ban") {
    const u = msg.mentions.members.first();
    if (!u) return;
    await u.ban();
    msg.reply("🚫 Banned");
  }

  if (cmd === "unban") {
    const id = args[0];
    if (!id) return;
    msg.guild.members.unban(id);
    msg.reply("♻️ Unbanned");
  }

  if (cmd === "mute") {
    const u = msg.mentions.members.first();
    if (!u) return;
    await u.timeout(10 * 60 * 1000);
    msg.reply("🔇 Muted");
  }

  if (cmd === "unmute") {
    const u = msg.mentions.members.first();
    if (!u) return;
    await u.timeout(null);
    msg.reply("🔊 Unmuted");
  }

  if (cmd === "clear") {
    let n = parseInt(args[0]);
    if (!n) return;
    msg.channel.bulkDelete(n);
    msg.reply("🧹 Cleared");
  }

  if (cmd === "slowmode") {
    let t = parseInt(args[0]);
    msg.channel.setRateLimitPerUser(t);
    msg.reply("🐢 Slowmode set");
  }

  // ================= HELP (PREMIUM UI STYLE) =================
  if (cmd === "help") {
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚡ HELP PANEL")
          .setColor("Gold")
          .setDescription("Choose a category:")
          .addFields(
            { name: "💰 Economy", value: ".bal .daily .work" },
            { name: "🛡 Moderation", value: ".kick .ban .mute .unmute .clear .warn .unban .slowmode" },
            { name: "🎮 Fun", value: ".ping .roll" },
            { name: "ℹ️ Info", value: ".userinfo .serverinfo" }
          )
      ]
    });
  }

  // ================= TICKET =================
  if (cmd === "panel") {
    msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Support Tickets")
          .setColor("Purple")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket")
            .setLabel("Create Ticket")
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  if (i.customId === "ticket") {
    const ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    ch.send("🎫 Staff will assist you soon");
    return i.reply({ content: "Ticket created", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
