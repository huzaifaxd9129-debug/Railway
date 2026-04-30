const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const OWNER_ID = "1363540480662704248";
const PREFIX = ".";

// ===== DATABASE =====
const eco = new Map();
const ticketCategoryName = "TICKETS";

// ===== READY =====
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "Advanced System 🚀" }],
    status: "dnd"
  });
});

// ================= ECONOMY FUNCTIONS =================
function getBal(id) {
  return eco.get(id) || { cash: 0, bank: 0 };
}
function setBal(id, data) {
  eco.set(id, data);
}

// ================= MESSAGE COMMANDS =================
client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.split(" ");
  const cmd = args[0].toLowerCase();

  // ===== OWNER NO PREFIX =====
  if (msg.author.id === OWNER_ID) {

    if (cmd === "bal") {
      const bal = getBal(msg.author.id);
      return msg.reply(`💰 Cash: ${bal.cash} | Bank: ${bal.bank}`);
    }

    if (cmd === "daily") {
      let bal = getBal(msg.author.id);
      bal.cash += 500;
      setBal(msg.author.id, bal);
      return msg.reply("💸 Daily claimed (Owner)");
    }
  }

  // ===== PREFIX COMMANDS =====
  if (!msg.content.startsWith(PREFIX)) return;

  const command = cmd.slice(PREFIX.length);

  // ===== ECONOMY =====
  if (command === "bal") {
    const bal = getBal(msg.author.id);
    return msg.reply(`💰 Cash: ${bal.cash} | Bank: ${bal.bank}`);
  }

  if (command === "daily") {
    let bal = getBal(msg.author.id);
    bal.cash += 200;
    setBal(msg.author.id, bal);
    return msg.reply("💸 You got 200 coins!");
  }

  if (command === "work") {
    let bal = getBal(msg.author.id);
    const earn = Math.floor(Math.random() * 300);
    bal.cash += earn;
    setBal(msg.author.id, bal);
    return msg.reply(`💼 You earned ${earn}`);
  }

  // ===== MODERATION =====
  if (command === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("No permission");

    const user = msg.mentions.users.first();
    await msg.guild.members.kick(user.id);
    msg.reply(`👢 Kicked ${user.tag}`);
  }

  if (command === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return msg.reply("No permission");

    const user = msg.mentions.users.first();
    await msg.guild.members.ban(user.id);
    msg.reply(`🚫 Banned ${user.tag}`);
  }

  // ===== TICKET PANEL =====
  if (command === "panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Support System")
      .setDescription("Click below to create a ticket")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Create Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    msg.channel.send({ embeds: [embed], components: [row] });
  }
});

// ================= BUTTONS =================
client.on('interactionCreate', async (interaction) => {

  if (interaction.isButton()) {

    // CREATE TICKET
    if (interaction.customId === "ticket_create") {

      let category = interaction.guild.channels.cache.find(
        c => c.name === ticketCategoryName && c.type === ChannelType.GuildCategory
      );

      if (!category) {
        category = await interaction.guild.channels.create({
          name: ticketCategoryName,
          type: ChannelType.GuildCategory
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 ${interaction.user} welcome! Staff will assist you.`,
        components: [row]
      });

      return interaction.reply({ content: `Created: ${channel}`, ephemeral: true });
    }

    // CLOSE TICKET
    if (interaction.customId === "ticket_close") {
      await interaction.reply("Closing...");
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }

  // ===== SLASH COMMAND EXAMPLE =====
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") {
      return interaction.reply(`🏓 ${client.ws.ping}ms`);
    }
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
