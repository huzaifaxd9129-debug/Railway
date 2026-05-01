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

// ================= COMMAND LOADER =================
client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (!command?.name) continue;

  client.commands.set(command.name, command);
}

console.log(`✅ Loaded ${client.commands.size} commands`);

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
    .setTitle(`Welcome ${member.user.username} 🎉`)
    .setDescription(`👋 Welcome to the server`)
    .setColor("Green")
    .setThumbnail(member.user.displayAvatarURL());

  ch.send({ embeds: [embed] });
});

// ================= MESSAGE COMMANDS =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const member = msg.mentions.members.first();

  // ================= LOADED COMMANDS =================
  const command = client.commands.get(cmdName);
  if (command) {
    try {
      return command.execute(client, msg, args, member, PermissionsBitField);
    } catch (err) {
      console.error(err);
      return msg.reply("❌ Error running command");
    }
  }

  // ================= PING =================
  if (cmdName === "ping") {
    return msg.reply(`🏓 Pong: ${client.ws.ping}ms`);
  }

  // ================= HELP PANEL =================
  if (cmdName === "help") {
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚡ HELP PANEL")
          .setColor("Gold")
          .setDescription("See All The Commands Here, Which Is Availble")
          .addFields(
            { name: "🛡 Moderation", value: "+ModHelp" },
            { name: "🎮 Fun", value: "+FunHelp" },
            { name: "💰 Economy", value: "+EcoHelp" }
          )
      ]
    });
  }

  // ================= TICKET PANEL =================
  if (cmdName === "ticketpanel") {
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
  if (cmdName === "giveaway") {
    let time = parseInt(args[0]) * 1000;
    let prize = args.slice(1).join(" ");

    if (!time || !prize) return msg.reply("Usage: +giveaway 10 Nitro");

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
