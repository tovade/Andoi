const weather = require("weather-js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "weather",
  noalias: "",
  category: "utility",
  description: "Shows weather of a city",
  usage: "[city name]",
  run: async (bot, message, args) => {
    try {
      if (!args[0])
        return message.channel.send("**Please Enter A City Name!**");

      weather.find(
        { search: args.join(" "), degreeType: "C" },
        function (err, result) {
          if (!result || result.length === 0) {
            return message.channel.send("**Please Enter A Valid Location.**");
          }

          var current = result[0].current;
          var location = result[0].location;

          const embed = new MessageEmbed()
            .setDescription(`**${current.skytext}**`)
            .setAuthor(`Weather for ${current.observationpoint}`)
            .setThumbnail(current.imageUrl)
            .setColor("GREEN")
            .addField("**Timezone**", `UTC ${location.timezone}`, true)
            .addField("**Degree Type**", `${location.degreetype}`, true)
            .addField("**Temperature**", `${current.temperature} Degrees`, true)
            .addField("**Feels Like**", `${current.feelslike} Degrees`, true)
            .addField("**Winds**", `${current.winddisplay}`, true)
            .addField("**Humidity**", `${current.humidity}%`, true)
            .addField("**Date**", `${current.date}`, true)
            .addField("**Day**", `${current.day}`, true)
            .setFooter(
              message.member.displayName,
              message.author.displayAvatarURL()
            )
            .setTimestamp();

          message.channel.send({ embed });
        }
      );
    } catch (err) {
      message.channel.send(err.message);
      throw Error(err.message);
    }
  },
};
