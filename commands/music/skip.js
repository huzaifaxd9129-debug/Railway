module.exports = {
  name: "skip",

  async execute(message, args, client) {

    const queue = client.player.nodes.get(message.guild);

    if (!queue || !queue.node.isPlaying()) {
      return message.reply("❌ Nothing is playing!");
    }

    queue.node.skip();

    message.reply("⏭ Skipped!");
  }
};
