const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun-handler",
  description: "15+ fun commands system",

  run: async (client, msg, args) => {
    if (!msg.content.startsWith(".")) return;

    const cmd = msg.content.split(" ")[0].slice(1).toLowerCase();

    // ================= RANDOM JOKE =================
    if (cmd === "joke") {
      const jokes = [
        "Why did the computer get cold? It left Windows open 🥶",
        "I told my PC a joke… it crashed 💀",
        "Why do programmers hate nature? Too many bugs 🐛"
      ];
      return msg.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    }

    // ================= MEME =================
    if (cmd === "meme") {
      const memes = ["😂 LMAO", "🤣 Too funny", "💀 I'm dead", "🔥 Banger meme"];
      return msg.reply(memes[Math.floor(Math.random() * memes.length)]);
    }

    // ================= 8BALL =================
    if (cmd === "8ball") {
      const answers = [
        "Yes ✅",
        "No ❌",
        "Maybe 🤔",
        "Definitely 💯",
        "Ask again later ⏳"
      ];
      return msg.reply(answers[Math.floor(Math.random() * answers.length)]);
    }

    // ================= COINFLIP =================
    if (cmd === "coinflip") {
      return msg.reply(Math.random() > 0.5 ? "🪙 Heads" : "🪙 Tails");
    }

    // ================= DICE =================
    if (cmd === "dice") {
      return msg.reply(`🎲 You rolled: ${Math.floor(Math.random() * 6) + 1}`);
    }

    // ================= ROLL =================
    if (cmd === "roll") {
      return msg.reply(`🎯 ${Math.floor(Math.random() * 100) + 1}`);
    }

    // ================= HUG =================
    if (cmd === "hug") {
      const user = msg.mentions.user?.first() || msg.author;
      return msg.reply(`🤗 ${msg.author.username} hugs ${user}`);
    }

    // ================= SLAP =================
    if (cmd === "slap") {
      const user = msg.mentions.user?.first();
      if (!user) return msg.reply("Mention someone");
      return msg.reply(`👋 ${msg.author.username} slapped ${user.username}`);
    }

    // ================= KISS =================
    if (cmd === "kiss") {
      const user = msg.mentions.user?.first();
      if (!user) return msg.reply("Mention someone");
      return msg.reply(`💋 ${msg.author.username} kissed ${user.username}`);
    }

    // ================= DANCE =================
    if (cmd === "dance") {
      return msg.reply(`💃 ${msg.author.username} is dancing!`);
    }

    // ================= CRY =================
    if (cmd === "cry") {
      return msg.reply(`😭 ${msg.author.username} is crying...`);
    }

    // ================= LAUGH =================
    if (cmd === "laugh") {
      return msg.reply(`😂 ${msg.author.username} is laughing hard!`);
    }

    // ================= RATE =================
    if (cmd === "rate") {
      const target = args.join(" ") || msg.author.username;
      const rate = Math.floor(Math.random() * 100);
      return msg.reply(`⭐ I rate ${target}: ${rate}/100`);
    }

    // ================= SHIP =================
    if (cmd === "ship") {
      const user = msg.mentions.users;
      if (!user) return msg.reply("Mention 2 users");
      const score = Math.floor(Math.random() * 100);
      return msg.reply(`💖 Love score: ${score}%`);
    }

    // ================= ASCII =================
    if (cmd === "ascii") {
      const text = args.join(" ");
      if (!text) return msg.reply("Provide text");
      return msg.reply("```" + text.toUpperCase() + "```");
    }

    // ================= FACT =================
    if (cmd === "fact") {
      const facts = [
        "Honey never spoils 🍯",
        "Octopuses have 3 hearts 🐙",
        "Sharks existed before trees 🦈"
      ];
      return msg.reply(facts[Math.floor(Math.random() * facts.length)]);
    }

    // ================= INSULT =================
    if (cmd === "insult") {
      const user = msg.mentions.users.first() || msg.author;
      const insults = [
        "You're like a cloud... when you disappear, it's a beautiful day ☁️",
        "You have something on your chin… no, the third one 💀",
        "You're proof that evolution can go in reverse 🧬"
      ];
      return msg.reply(`${user.username}, ${insults[Math.floor(Math.random() * insults.length)]}`);
    }

    // ================= COMPLIMENT =================
    if (cmd === "compliment") {
      const user = msg.mentions.users.first() || msg.author;
      const compliments = [
        "You're amazing ✨",
        "You're awesome 🔥",
        "You're a legend 👑"
      ];
      return msg.reply(`${user.username}, ${compliments[Math.floor(Math.random() * compliments.length)]}`);
    }

    // ================= EMOJI =================
    if (cmd === "emoji") {
      const emojis = ["😂", "🤣", "🔥", "💀", "😍", "😎", "🥶"];
      return msg.reply(emojis[Math.floor(Math.random() * emojis.length)]);
    }

    // ================= REVERSE =================
    if (cmd === "reverse") {
      const text = args.join(" ");
      if (!text) return msg.reply("Provide text");
      return msg.reply(text.split("").reverse().join(""));
    }

    // ================= HELP =================
    if (cmd === "funhelp") {
      return msg.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎮 FUN COMMANDS")
            .setColor("Blue")
            .setDescription(`
joke, meme, 8ball, coinflip, dice,
roll, hug, slap, kiss, dance,
cry, laugh, rate, ship, ascii,
fact, insult, compliment, emoji, reverse
            `)
        ]
      });
    }
  }
};
