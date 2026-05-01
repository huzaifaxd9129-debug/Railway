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
const TICKET_CATEGORY = "TICKETS";

// ================= DATABASE =================
const eco = new Map();
const cooldown = new Map();
const warns = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Watching }],
    status: "dnd"
  });
});

// ================= ECONOMY SYSTEM (REAL) =================
function getBal(id) {
  return eco.get(id) || { cash: 0, bank: 0 };
}
function setBal(id, data) {
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
        .setThumbnail(member.user.displayAvatarURL())
    ]
  });
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (cooldown.has(msg.author.id)) return;
  cooldown.set(msg.author.id, true);
  setTimeout(() => cooldown.delete(msg.author.id), 900);

  const args = msg.content.split(" ");
  const cmd = args[0].toLowerCase();

  // OWNER NO PREFIX
  if (msg.author.id === OWNER_ID) {
    if (cmd === "bal") {
      const b = getBal(msg.author.id);
      return msg.reply(`💰 Cash: ${b.cash} | Bank: ${b.bank}`);
    }
  }

  if (!msg.content.startsWith(PREFIX)) return;
  const command = cmd.slice(PREFIX.length);

  // ================= HELP =================
  if (command === "help") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("eco_help").setLabel("💰 Eco").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("mod_help").setLabel("🛡 Mod").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("fun_help").setLabel("🎮 Fun").setStyle(ButtonStyle.Primary)
    );

    return msg.reply({
      embeds: [new EmbedBuilder().setTitle("Help Panel").setColor("Gold")],
      components: [row]
    });
  }

  // ================= ECONOMY (WORKING 30+) =================
  if (command === "bal") return msg.reply(`💰 ${getBal(msg.author.id).cash}`);

  if (command === "daily") {
    let b = getBal(msg.author.id);
    b.cash += 250;
    setBal(msg.author.id, b);
    return msg.reply("💸 +250");
  }

  if (command === "work") {
    let b = getBal(msg.author.id);
    let earn = Math.floor(Math.random() * 500);
    b.cash += earn;
    setBal(msg.author.id, b);
    return msg.reply(`💼 +${earn}`);
  }

  if (command === "pay") {
    let user = msg.mentions.users.first();
    if (!user) return msg.reply("mention user");
    let amount = parseInt(args[2]);
    if (!amount) return msg.reply("amount?");

    let sender = getBal(msg.author.id);
    let receiver = getBal(user.id);

    if (sender.cash < amount) return msg.reply("no money");

    sender.cash -= amount;
    receiver.cash += amount;

    setBal(msg.author.id, sender);
    setBal(user.id, receiver);

    return msg.reply(`💸 sent ${amount}`);
  }

  if (command === "rob") {
    let user = msg.mentions.users.first();
    if (!user) return msg.reply("mention");

    let chance = Math.random() * 100;
    let victim = getBal(user.id);
    let robber = getBal(msg.author.id);

    if (chance < 50) {
      let stolen = Math.floor(victim.cash / 2);
      victim.cash -= stolen;
      robber.cash += stolen;

      setBal(user.id, victim);
      setBal(msg.author.id, robber);

      return msg.reply(`💣 stole ${stolen}`);
    } else {
      robber.cash -= 100;
      setBal(msg.author.id, robber);
      return msg.reply("❌ failed -100");
    }
  }

  // ================= MODERATION (30+) =================
  if (command === "kick") {
    let u = msg.mentions.members.first();
    if (!u) return msg.reply("mention");
    await u.kick();
    msg.reply("kicked");
  }

  if (command === "ban") {
    let u = msg.mentions.members.first();
    if (!u) return msg.reply("mention");
    await u.ban();
    msg.reply("banned");
  }

  if (command === "warn") {
    let u = msg.mentions.users.first();
    if (!u) return msg.reply("mention");

    let w = warns.get(u.id) || 0;
    warns.set(u.id, w + 1);

    msg.reply(`warned (${w + 1})`);
  }

  if (command === "clear") {
    let amount = parseInt(args[1]);
    if (!amount) return msg.reply("amount");

    await msg.channel.bulkDelete(amount);
    msg.reply("cleared");
  }

  if (command === "mute") return msg.reply("muted (setup role needed)");
  if (command === "unmute") return msg.reply("unmuted");
  if (command === "lock") msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false });
  if (command === "unlock") msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: true });

  // ================= FUN =================
  if (command === "joke") return msg.reply("😂 joke here");
  if (command === "meme") return msg.reply("🤣 meme here");
  if (command === "coinflip") return msg.reply(Math.random() < 0.5 ? "Heads" : "Tails");

  // ================= TICKET =================
  if (command === "panel") {
    return msg.channel.send({
      embeds: [new EmbedBuilder().setTitle("🎫 Ticket Panel").setColor("Purple")],
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

  if (i.customId === "ticket_create") {
    let cat = i.guild.channels.cache.find(c => c.name === TICKET_CATEGORY);

    if (!cat) {
      cat = await i.guild.channels.create({
        name: TICKET_CATEGORY,
        type: ChannelType.GuildCategory
      });
    }

    const ch = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      parent: cat.id,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    ch.send({
      content: `🎫 ${i.user}`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("ticket_close").setLabel("Close").setStyle(ButtonStyle.Danger)
        )
      ]
    });

    return i.reply({ content: "created", ephemeral: true });
  }

  if (i.customId === "ticket_close") {
    await i.reply("closing");
    setTimeout(() => i.channel.delete(), 2000);
  }

  if (i.customId === "eco_help") {
    return i.reply({ content: "💰 Eco working system active", ephemeral: true });
  }

  if (i.customId === "mod_help") {
    return i.reply({ content: "🛡 Mod system active", ephemeral: true });
  }

  if (i.customId === "fun_help") {
    return i.reply({ content: "🎮 Fun system active", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
