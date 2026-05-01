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

// ================= DATABASE (MEMORY ONLY) =================
const eco = new Map();
const cooldown = new Set();
const giveaways = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= ECONOMY =================
function getUser(id) {
  return eco.get(id) || { cash: 0, bank: 0 };
}
function setUser(id, data) {
  eco.set(id, data);
}

// ================= WELCOME =================
client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;

  ch.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("👋 Welcome!")
        .setDescription(`Welcome ${member} to **${member.guild.name}**`)
        .setColor("Green")
    ]
  });
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // anti spam cooldown
  if (cooldown.has(msg.author.id)) return;
  cooldown.add(msg.author.id);
  setTimeout(() => cooldown.delete(msg.author.id), 800);

  const args = msg.content.split(" ");
  const cmd = args[0].toLowerCase();

  if (!msg.content.startsWith(PREFIX)) return;
  const command = cmd.slice(PREFIX.length);

  let user = getUser(msg.author.id);

  // ================= HELP MENU =================
  if (command === "help") {
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚡ Premium Help Panel")
          .setColor("Gold")
          .setDescription("Choose category below")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("eco").setLabel("💰 Economy").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("mod").setLabel("🛡 Moderation").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("fun").setLabel("🎮 Fun").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("ticket").setLabel("🎫 Ticket").setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  // ================= ECONOMY =================
  if (command === "bal") {
    return msg.reply(`💰 Cash: ${user.cash}`);
  }

  if (command === "daily") {
    user.cash += 250;
    setUser(msg.author.id, user);
    return msg.reply("💸 +250 coins");
  }

  if (command === "work") {
    let earn = Math.floor(Math.random() * 500);
    user.cash += earn;
    setUser(msg.author.id, user);
    return msg.reply(`💼 Earned ${earn}`);
  }

  if (command === "pay") {
    let target = msg.mentions.users.first();
    let amount = parseInt(args[2]);

    if (!target || !amount) return msg.reply("Usage: .pay @user amount");

    let tUser = getUser(target.id);

    if (user.cash < amount) return msg.reply("❌ Not enough money");

    user.cash -= amount;
    tUser.cash += amount;

    setUser(msg.author.id, user);
    setUser(target.id, tUser);

    return msg.reply(`💸 Sent ${amount}`);
  }

  // ================= MODERATION =================
  if (command === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("❌ No permission");

    let m = msg.mentions.members.first();
    if (!m) return msg.reply("Mention user");

    await m.kick();
    msg.reply("👢 Kicked");
  }

  if (command === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return msg.reply("❌ No permission");

    let m = msg.mentions.members.first();
    if (!m) return msg.reply("Mention user");

    await m.ban();
    msg.reply("🚫 Banned");
  }

  if (command === "clear") {
    let amount = parseInt(args[1]);
    if (!amount) return msg.reply("Enter number");

    await msg.channel.bulkDelete(amount);
    msg.reply("🧹 Cleared");
  }

  // ================= FUN =================
  if (command === "joke") return msg.reply("😂 Why did the bot cross the road?");
  if (command === "coinflip") return msg.reply(Math.random() < 0.5 ? "Heads" : "Tails");

  // ================= TICKET PANEL =================
  if (command === "panel") {
    return msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Ticket System")
          .setColor("Purple")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_create")
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

  if (i.customId === "eco")
    return i.reply({ content: "💰 Economy System Active", ephemeral: true });

  if (i.customId === "mod")
    return i.reply({ content: "🛡 Moderation Active", ephemeral: true });

  if (i.customId === "fun")
    return i.reply({ content: "🎮 Fun Active", ephemeral: true });

  if (i.customId === "ticket") {
    let ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    ch.send("🎫 Support will help you soon");
    return i.reply({ content: "Ticket created", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
