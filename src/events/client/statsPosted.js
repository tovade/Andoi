const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "statsPosted",
  execute(client) {
    const embed = new MessageEmbed()
      .setTitle("Bot stats posted!")
      .setDescription("stats listed below")
      .addField(
        "Guilds",
        `  ${client.utils.formatNumber(client.guilds.cache.size)}`
      );
    client.channels.cache.get("804758786396520478").send(embed);
  },
};
