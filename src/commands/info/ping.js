const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "ping",
  aliases: ["pong"],
  category: "info",
  usage: "ping",
  description: "Get the bot's ping!",
  run: async (client, message, args) => {
    message.channel.send("Testing ping...").then(async (m) => {
      let dataPing = Date.now();
      await message.guild.getConfig();
      let dataPingNow = Date.now();
      let dataRealPing = dataPingNow - dataPing;
      const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setTitle("🏓 Pong!")
        .setDescription(
          `Discord api Latency - **${Math.round(
            client.ws.ping
          )}**ms\nDatabase Latency - **${dataRealPing}**ms`
        )
        .setColor("RED");
      m.edit(embed);
    });
  },
};
