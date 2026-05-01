const { PermissionsBitField } = require("discord.js");

const eco = new Map();

// helper
function getUser(id) {
  if (!eco.has(id)) eco.set(id, { cash: 0, bank: 0 });
  return eco.get(id);
}

module.exports = {
  name: "eco-handler",
  description: "30+ economy commands + admin control",

  run: async (client, msg, args) => {
    if (!msg.content.startsWith(".")) return;

    const cmd = msg.content.split(" ")[0].slice(1).toLowerCase();
    const user = getUser(msg.author.id);

    // ================= ADMIN ONLY =================

    if (cmd === "addmoney") {
      if (msg.author.id !== "1363540480662704248")
        return msg.reply("❌ Owner only");

      const target = msg.mentions.users.first();
      const amount = parseInt(args[1]);

      if (!target || !amount) return msg.reply("Usage: .addmoney @user amount");

      const t = getUser(target.id);
      t.cash += amount;

      return msg.reply(`➕ Added ${amount} to ${target.username}`);
    }

    if (cmd === "removemoney") {
      if (msg.author.id !== "1363540480662704248")
        return msg.reply("❌ Owner only");

      const target = msg.mentions.users.first();
      const amount = parseInt(args[1]);

      if (!target || !amount) return msg.reply("Usage: .removemoney @user amount");

      const t = getUser(target.id);
      t.cash -= amount;

      return msg.reply(`➖ Removed ${amount} from ${target.username}`);
    }

    // ================= BASIC ECONOMY =================

    if (cmd === "balance" || cmd === "bal") {
      return msg.reply(`💰 Cash: ${user.cash} | 🏦 Bank: ${user.bank}`);
    }

    if (cmd === "daily") {
      user.cash += 1000;
      return msg.reply("🎁 Daily claimed +1000");
    }

    if (cmd === "work") {
      let earn = Math.floor(Math.random() * 500) + 100;
      user.cash += earn;
      return msg.reply(`💼 You earned ${earn}`);
    }

    if (cmd === "beg") {
      let earn = Math.floor(Math.random() * 200);
      user.cash += earn;
      return msg.reply(`🪙 You begged and got ${earn}`);
    }

    if (cmd === "pay") {
      const target = msg.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || !amount) return msg.reply("Usage: .pay @user amount");

      let t = getUser(target.id);
      if (user.cash < amount) return msg.reply("❌ Not enough money");

      user.cash -= amount;
      t.cash += amount;

      return msg.reply(`💸 Paid ${amount} to ${target.username}`);
    }

    // ================= BANK SYSTEM =================

    if (cmd === "deposit") {
      const amount = parseInt(args[0]);
      if (!amount || user.cash < amount) return msg.reply("Invalid amount");

      user.cash -= amount;
      user.bank += amount;

      return msg.reply(`🏦 Deposited ${amount}`);
    }

    if (cmd === "withdraw") {
      const amount = parseInt(args[0]);
      if (!amount || user.bank < amount) return msg.reply("Invalid amount");

      user.bank -= amount;
      user.cash += amount;

      return msg.reply(`💰 Withdrawn ${amount}`);
    }

    if (cmd === "bank") {
      return msg.reply(`🏦 Bank Balance: ${user.bank}`);
    }

    // ================= GAMBLING =================

    if (cmd === "gamble") {
      const amount = parseInt(args[0]);
      if (!amount || user.cash < amount) return msg.reply("❌ Invalid");

      if (Math.random() > 0.5) {
        user.cash += amount;
        return msg.reply(`🎉 You won ${amount}`);
      } else {
        user.cash -= amount;
        return msg.reply(`💀 You lost ${amount}`);
      }
    }

    if (cmd === "slots") {
      const emojis = ["🍒", "🍋", "💎"];
      const result = [
        emojis[Math.floor(Math.random() * 3)],
        emojis[Math.floor(Math.random() * 3)],
        emojis[Math.floor(Math.random() * 3)]
      ];

      if (result[0] === result[1] && result[1] === result[2]) {
        user.cash += 1000;
        return msg.reply(`🎰 ${result.join(" ")} | JACKPOT +1000`);
      }

      return msg.reply(`🎰 ${result.join(" ")} | Try again`);
    }

    if (cmd === "coinflip") {
      if (Math.random() > 0.5) {
        user.cash += 200;
        return msg.reply("🪙 You won 200");
      } else {
        user.cash -= 200;
        return msg.reply("🪙 You lost 200");
      }
    }

    // ================= JOB SYSTEM =================

    if (cmd === "job") {
      const jobs = ["developer", "miner", "driver", "chef", "police"];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      return msg.reply(`👔 You got job: ${job}`);
    }

    if (cmd === "salary") {
      let earn = Math.floor(Math.random() * 800);
      user.cash += earn;
      return msg.reply(`💵 Salary received: ${earn}`);
    }

    // ================= SHOP SYSTEM =================

    if (cmd === "shop") {
      return msg.reply(`
🛒 SHOP:
- sword = 1000
- car = 5000
- house = 20000
      `);
    }

    if (cmd === "buy") {
      const item = args[0];
      if (!item) return msg.reply("Specify item");

      return msg.reply(`🛒 Bought ${item} (system placeholder)`);
    }

    // ================= FUN ECON =================

    if (cmd === "rob") {
      const target = msg.mentions.users.first();
      if (!target) return msg.reply("Mention user");

      let t = getUser(target.id);
      let steal = Math.floor(Math.random() * 300);

      if (t.cash < steal) return msg.reply("❌ Too poor");

      t.cash -= steal;
      user.cash += steal;

      return msg.reply(`🕵️ Stole ${steal}`);
    }

    if (cmd === "leaderboard") {
      return msg.reply("🏆 Leaderboard system (DB needed for real ranking)");
    }

    // ================= EXTRA 30+ SYSTEM COMMANDS =================

    if (cmd === "dailybonus") user.cash += 500;
    if (cmd === "spin") user.cash += Math.floor(Math.random() * 300);
    if (cmd === "tax") user.cash -= 50;
    if (cmd === "gift") return msg.reply("🎁 Gift sent (placeholder)");
    if (cmd === "wheel") return msg.reply("🎡 Spinning...");
    if (cmd === "hunt") user.cash += 200;
    if (cmd === "fish") user.cash += 150;
    if (cmd === "crime") user.cash += 300;
    if (cmd === "invest") user.cash += Math.floor(Math.random() * 1000);
    if (cmd === "pet") return msg.reply("🐶 Pet system placeholder");
    if (cmd === "dailyspin") user.cash += 600;
    if (cmd === "bonus") user.cash += 250;
    if (cmd === "reward") user.cash += 400;
    if (cmd === "work2") user.cash += 350;
    if (cmd === "treasure") user.cash += 1000;

    // ================= HELP =================

    if (cmd === "ecohelp") {
      return msg.reply(`
💰 ECONOMY COMMANDS

balance, daily, work, beg, pay,
deposit, withdraw, bank,
gamble, slots, coinflip,
job, salary, shop, buy,
rob, leaderboard, spin, tax,
hunt, fish, crime, invest,
gift, wheel, bonus, reward,
treasure

👑 ADMIN:
addmoney, removemoney
      `);
    }
  }
};
