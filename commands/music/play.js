const { QueryType } = require("discord-player");

module.exports = {
  name: "play",

  async execute(message, args, client) {

    if (!message.member.voice.channel) {
      return message.reply("❌ Join a voice channel first!");
    }

    const song = args.join(" ");
    if (!song) return message.reply("❌ Provide a song name!");

    const queue = await client.player.nodes.create(message.guild, {
      metadata: {
        channel: message.channel
      },
      selfDeaf: true
    });

    if (!queue.connection) {
      await queue.connect(message.member.voice.channel);
    }

    const result = await client.player.search(song, {
      requestedBy: message.author,
      searchEngine: QueryType.AUTO
    });

    if (!result.tracks.length) {
      return message.reply("❌ No results found!");
    }

    const track = result.tracks[0];

    queue.addTrack(track);

    if (!queue.node.isPlaying()) {
      await queue.node.play();
    }

    message.reply(`🎵 Playing: **${track.title}**`);
  }
};
