const { Player } = require("discord-player");

module.exports = (client) => {

  const player = new Player(client, {
    ytdlOptions: {
      quality: "highestaudio",
      highWaterMark: 1 << 25
    }
  });

  client.player = player;

  // IMPORTANT: register extractors properly
  async function loadExtractors() {
    await player.extractors.loadDefault();
  }

  loadExtractors();

  console.log("🎵 Player loaded successfully!");
};
