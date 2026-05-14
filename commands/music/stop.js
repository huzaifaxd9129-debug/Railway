module.exports = {
  name: "stop",

  async execute(message, args, client) {

    const queue = client.player.nodes.get(message.guild);

    if (!queue) {
      return message.reply("❌ Nothing is playing!");
    }

    queue.delete();

    message.reply("⏹ Music stopped!");
  }
};
