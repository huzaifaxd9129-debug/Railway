const { Player } = require("discord-player");

module.exports = (client) => {
  const player = new Player(client);

  client.player = player;

  player.extractors.loadDefault();

  console.log("🎵 Music system ready!");
};
