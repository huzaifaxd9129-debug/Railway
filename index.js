const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: Object.values(GatewayIntentBits)
});

const PREFIX = ".";
const WELCOME_CHANNEL = "123456789012345678";

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= WELCOME SYSTEM =================
client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL);
  if (!ch) return;

  const embed = new EmbedBuilder()
    .setTitle("Welcome ${member} 🎉")
    .setDescription(`👋 Welcome to the server`)
    .setColor("Green")
    .setThumbnail(member.user.displayAvatarURL());

  ch.send({ embeds: [embed] });
});

// ================= MESSAGE COMMANDS =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  // ================= PING =================
  if (cmd === "ping") {
    return msg.reply(`🏓 Pong: ${client.ws.ping}ms`);
  }

  // ================= HELP PANEL =================
  if (cmd === "help") {
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚡ HELP PANEL")
          .setColor("Gold")
          .setDescription("All systems loaded")
          .addFields(
            { name: "🛡 Moderation", value: "mod commands loaded" },
            { name: "🎮 Fun", value: "fun commands loaded" },
            { name: "💰 Economy", value: "eco commands loaded" },
            { name: "🎫 Systems", value: "ticket / giveaway / welcome" }
          )
      ]
    });
  }

  // ================= TICKET PANEL =================
  if (cmd === "ticketpanel") {
    msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Support System")
          .setDescription("Click button to open ticket")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_create")
            .setLabel("Open Ticket")
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }

  // ================= GIVEAWAY =================
  if (cmd === "giveaway") {
    let time = parseInt(args[0]) * 1000;
    let prize = args.slice(1).join(" ");

    if (!time || !prize) return msg.reply("Usage: .giveaway 10 Nitro");

    let gmsg = await msg.channel.send(`🎉 GIVEAWAY: **${prize}**\nReact 🎉`);

    await gmsg.react("🎉");

    setTimeout(async () => {
      let users = (await gmsg.reactions.cache.get("🎉").users.fetch())
        .filter(u => !u.bot)
        .map(u => u.id);

      let winner = users[Math.floor(Math.random() * users.length)];

      msg.channel.send(`🏆 Winner: <@${winner}>`);
    }, time);
  }
});

// ================= BUTTON INTERACTIONS =================
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  // TICKET CREATE
  if (i.customId === "ticket_create") {
    const ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: i.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: i.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    ch.send("🎫 Support will arrive soon");

    return i.reply({ content: "Ticket created!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
