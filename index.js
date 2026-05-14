const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ===== CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ===== COLLECTIONS =====
client.commands = new Collection();
client.player = null;

// ===== PREFIX =====
const prefix = "+";

// ===== LOAD MUSIC SYSTEM =====
require("./music/player")(client);

// ===== BOT STATUS =====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "🎵 Music System | +play",
        type: 2 // LISTENING
      }
    ],
    status: "online"
  });
});

// ===== LOAD COMMANDS =====
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if (command.name) {
      client.commands.set(command.name, command);
      console.log(`🎵 Loaded command: ${command.name}`);
    }
  }
}

// ===== MESSAGE HANDLER =====
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd);
  if (!command) return;

  try {
    command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply("❌ Error executing command!");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
