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

// ===== CONFIG =====
const OWNER_ID = "1363540480662704248";
const PREFIX = ".";
const WELCOME_CHANNEL_ID = "123456789012345678";
const ticketCategoryName = "TICKETS";

// ===== DATABASE =====
const eco = new Map();
const cooldown = new Map();

// ===== READY =====
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// ================= ECONOMY =================
function getBal(id) {
  return eco.get(id) || { cash: 0, bank: 0 };
}
function setBal(id, data) {
  eco.set(id, data);
}

// ================= WELCOME SYSTEM =================
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Welcome!")
    .setDescription(`Hey ${member}, welcome to **${member.guild.name}** 🚀`)
    .setColor("Green")
    .addFields(
      { name: "👥 Members", value: `${member.guild.memberCount}`, inline: true },
      { name: "📌 Enjoy!", value: "Read rules & have fun 😄", inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "Welcome System" });

  channel.send({ embeds: [embed] });
});

// ================= MESSAGE COMMANDS =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // cooldown (anti spam)
  if (cooldown.has(msg.author.id)) return;
  cooldown.set(msg.author.id, true);
  setTimeout(() => cooldown.delete(msg.author.id), 1500);

  const args = msg.content.split(" ");
  const rawCmd = args[0].toLowerCase();

  // ===== OWNER NO PREFIX =====
  if (msg.author.id === OWNER_ID) {
    if (rawCmd === "bal") {
      const bal = getBal(msg.author.id);
      return msg.reply(`💰 Cash: ${bal.cash} | Bank: ${bal.bank}`);
    }
    if (rawCmd === "daily") {
      let bal = getBal(msg.author.id);
      bal.cash += 500;
      setBal(msg.author.id, bal);
      return msg.reply("💸 Owner Daily +500");
    }
  }

  // ===== PREFIX CHECK =====
  if (!msg.content.startsWith(PREFIX)) return;
  const command = rawCmd.slice(PREFIX.length);

  // ================= HELP =================
  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Help Panel")
      .setColor("Blue")
      .setDescription("Choose a category below");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_eco").setLabel("💰 Economy").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_mod").setLabel("🛡 Moderation").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("help_ticket").setLabel("🎫 Tickets").setStyle(ButtonStyle.Success)
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }

  // ================= ECONOMY =================
  if (command === "bal") {
    const bal = getBal(msg.author.id);
    return msg.reply(`💰 Cash: ${bal.cash} | Bank: ${bal.bank}`);
  }

  if (command === "daily") {
    let bal = getBal(msg.author.id);
    bal.cash += 200;
    setBal(msg.author.id, bal);
    return msg.reply("💸 +200 coins");
  }

  if (command === "work") {
    let bal = getBal(msg.author.id);
    const earn = Math.floor(Math.random() * 300) + 1;
    bal.cash += earn;
    setBal(msg.author.id, bal);
    return msg.reply(`💼 Earned ${earn} coins`);
  }

  // ================= MODERATION =================
  if (command === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("❌ No permission");

    const user = msg.mentions.members.first();
    if (!user) return msg.reply("❌ Mention user");

    await user.kick();
    msg.reply(`👢 Kicked ${user.user.tag}`);
  }

  if (command === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return msg.reply("❌ No permission");

    const user = msg.mentions.members.first();
    if (!user) return msg.reply("❌ Mention user");

    await user.ban();
    msg.reply(`🚫 Banned ${user.user.tag}`);
  }

  // ================= TICKET =================
  if (command === "panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Support System")
      .setColor("Purple")
      .setDescription("Click below to create a ticket");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ticket_create").setLabel("Create Ticket").setStyle(ButtonStyle.Success)
    );

    msg.channel.send({ embeds: [embed], components: [row] });
  }
});

// ================= BUTTONS =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // HELP BUTTONS
  if (interaction.customId === "help_eco") {
    return interaction.reply({
      content: "💰 Economy: .bal .daily .work",
      ephemeral: true
    });
  }

  if (interaction.customId === "help_mod") {
    return interaction.reply({
      content: "🛡 Moderation: .kick .ban",
      ephemeral: true
    });
  }

  if (interaction.customId === "help_ticket") {
    return interaction.reply({
      content: "🎫 Tickets: .panel",
      ephemeral: true
    });
  }

  // TICKET CREATE
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
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `🎫 ${interaction.user} wait for staff...`,
      components: [row]
    });

    return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
  }

  // CLOSE TICKET
  if (interaction.customId === "ticket_close") {
    await interaction.reply("Closing...");
    setTimeout(() => interaction.channel.delete(), 2000);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
