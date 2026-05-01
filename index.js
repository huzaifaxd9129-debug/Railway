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

const mongoose = require("mongoose");
const ms = require("ms");

// ================= CONFIG =================
const PREFIX = ".";
const OWNER_ID = "1363540480662704248";
const WELCOME_CHANNEL_ID = "123456789012345678";
const TOKEN = process.env.TOKEN;
const MONGO = process.env.MONGO_URI;

// ================= DB CONNECT =================
mongoose.connect(MONGO).then(() => console.log("DB Connected"));

// ================= MODELS =================
const ecoSchema = new mongoose.Schema({
  id: String,
  cash: Number,
  bank: Number,
  xp: Number,
  level: Number
});
const Eco = mongoose.model("eco", ecoSchema);

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= ECONOMY =================
async function getUser(id) {
  let user = await Eco.findOne({ id });
  if (!user) {
    user = await Eco.create({ id, cash: 0, bank: 0, xp: 0, level: 1 });
  }
  return user;
}

// ================= LEVEL SYSTEM =================
async function addXP(user) {
  user.xp += 5;
  if (user.xp >= user.level * 100) {
    user.level++;
    user.xp = 0;
  }
  await user.save();
}

// ================= WELCOME =================
client.on("guildMemberAdd", async (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;

  ch.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("👋 Welcome to Limit Server")
        .setDescription(`Hey ${member}, welcome!`)
        .setColor("Green")
    ]
  });
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.split(" ");
  const cmd = args[0].toLowerCase();

  const user = await getUser(msg.author.id);
  await addXP(user);

  if (!msg.content.startsWith(PREFIX)) return;
  const command = cmd.slice(PREFIX.length);

  // ================= HELP =================
  if (command === "help") {
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚡ LIMIT BREAKER HELP")
          .setColor("Gold")
          .setDescription("Select category below")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("eco").setLabel("💰 Economy").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("mod").setLabel("🛡 Mod").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("fun").setLabel("🎮 Fun").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("util").setLabel("⚙ Utility").setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  // ================= ECONOMY =================
  if (command === "bal") return msg.reply(`💰 Cash: ${user.cash}`);

  if (command === "daily") {
    user.cash += 300;
    await user.save();
    return msg.reply("💸 +300 coins");
  }

  if (command === "work") {
    let earn = Math.floor(Math.random() * 700);
    user.cash += earn;
    await user.save();
    return msg.reply(`💼 Earned ${earn}`);
  }

  if (command === "pay") {
    let target = msg.mentions.users.first();
    let amount = parseInt(args[2]);

    if (!target || !amount) return msg.reply("Usage .pay @user amount");

    let tUser = await getUser(target.id);

    if (user.cash < amount) return msg.reply("❌ Not enough");

    user.cash -= amount;
    tUser.cash += amount;

    await user.save();
    await tUser.save();

    return msg.reply(`💸 sent ${amount}`);
  }

  // ================= MODERATION =================
  if (command === "kick") {
    let m = msg.mentions.members.first();
    if (!m) return msg.reply("mention");

    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("no perm");

    await m.kick();
    msg.reply("kicked");
  }

  if (command === "ban") {
    let m = msg.mentions.members.first();
    if (!m) return msg.reply("mention");

    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return msg.reply("no perm");

    await m.ban();
    msg.reply("banned");
  }

  if (command === "clear") {
    let amt = parseInt(args[1]);
    if (!amt) return;

    await msg.channel.bulkDelete(amt);
    msg.reply("cleaned");
  }

  // ================= FUN =================
  if (command === "joke") return msg.reply("😂 AI joke system loading...");
  if (command === "coinflip") return msg.reply(Math.random() < 0.5 ? "Heads" : "Tails");

  // ================= TICKET =================
  if (command === "panel") {
    return msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Tickets")
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

  if (i.customId === "eco") return i.reply({ content: "💰 Economy Active", ephemeral: true });
  if (i.customId === "mod") return i.reply({ content: "🛡 Moderation Active", ephemeral: true });
  if (i.customId === "fun") return i.reply({ content: "🎮 Fun Active", ephemeral: true });
  if (i.customId === "util") return i.reply({ content: "⚙ Utilities Active", ephemeral: true });

  if (i.customId === "ticket") {
    const cat = i.guild.channels.cache.find(c => c.name === "TICKETS");

    const ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      parent: cat?.id || null,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    ch.send("🎫 Support will come soon");
    return i.reply({ content: "Ticket created", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(TOKEN);
