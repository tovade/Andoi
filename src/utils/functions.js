const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const yes = ["yes", "y", "ye", "yea", "correct"];
const no = ["no", "n", "nah", "nope", "fuck off"];
const config = require("../../config");
const errorLogsChannelId = config.error;
const {
  promises: { lstat, readdir },
} = require("fs");
const moment = require("moment");
const path = require("path");
module.exports = class Utils {
  constructor(client) {
    this.client = client;
  }
  formatDuration(duration) {
    return moment.duration(duration).format("hh:mm:ss", { stopTrim: "m" });
  }
  /**
   * @param {Object} error
   * @param {String} type
   * @param {String} msgContent
   */
  sendErrorLog(error, type, msgContent) {
    const name = error.name || "N/A";
    const code = String(error.code) || "N/A";
    const httpStatus = error.httpStatus || "N/A";
    const stack = error.stack || "N/A";
    const content = msgContent || "N/A";
    const embed = new MessageEmbed()
      .setTitle("An error occurred")
      .addField("Name", name, true)
      .addField("Code", `\n${code}`, true)
      .addField("httpStatus", httpStatus, true)
      .addField("Command executed", content, true)
      .setDescription(`\`\`\`${stack}\`\`\` `)
      .setColor(type === "error" ? "RED" : "ORANGE");

    this.client.channels.cache.get(errorLogsChannelId)?.send(embed);
  }
  list(arr, conj = "and") {
    const len = arr.length;
    if (len === 0) return "";
    if (len === 1) return arr[0];
    return `${arr.slice(0, -1).join(", ")}${
      len > 1 ? `${len > 2 ? "," : ""} ${conj} ` : ""
    }${arr.slice(-1)}`;
  }
  async promptMessage(message, author, time, validReactions) {
    time *= 1000;

    for (const reaction of validReactions) await message.react(reaction);

    const filter = (reaction, user) =>
      validReactions.includes(reaction.emoji.name) && user.id === author.id;

    return message
      .awaitReactions(filter, { max: 1, time: time })
      .then((collected) => collected.first() && collected.first().emoji.name);
  }
  wrapText(ctx, text, maxWidth) {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) {
            words[1] = `${temp.slice(-1)}${words[1]}`;
          } else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
          line += `${words.shift()} `;
        } else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  removeDuplicates(arr) {
    if (arr.length === 0 || arr.length === 1) return arr;
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (newArr.includes(arr[i])) continue;
      newArr.push(arr[i]);
    }
    return newArr;
  }
  firstUpperCase(text, split = " ") {
    return text
      .split(split)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(" ");
  }
  formatNumber(number, minimumFractionDigits = 0) {
    return Number.parseFloat(number).toLocaleString(undefined, {
      minimumFractionDigits,
      maximumFractionDigits: 2,
    });
  }

  formatNumberK(number) {
    return number > 999
      ? `${(number / 1000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })}K`
      : number;
  }

  formatTime(time) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time - min * 60);
    const ms = time - sec - min * 60;
    return `${min}:${sec.toString().padStart(2, "0")}.${ms
      .toFixed(4)
      .slice(2)}`;
  }
  base64(text, mode = "encode") {
    if (mode === "encode") return Buffer.from(text).toString("base64");
    if (mode === "decode")
      return Buffer.from(text, "base64").toString("utf8") || null;
    throw new TypeError(`${mode} is not a supported base64 mode.`);
  }
  async binary(text, mode = "encode") {
    if (mode === "encode") {
      const data = await fetch(
        `https://some-random-api.ml/binary?text=${text}`
      ).then((res) => res.json());
      return data.binary;
    }
    if (mode === "decode") {
      const data = await fetch(
        `https://some-random-api.ml/binary?decode=${text}`
      ).then((res) => res.json());
      return data.text;
    }
  }
  makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  moneyFormat(amount) {
    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return formatter.format(amount);
  }
  async walk(dir, options = {}, results = new Map(), level = -1) {
    dir = path.resolve(dir);
    const stats = await lstat(dir);
    if (!options.filter || options.filter(stats, dir)) results.set(dir, stats);
    if (
      stats.isDirectory() &&
      (typeof options.depthLimit === "undefined" || level < options.depthLimit)
    ) {
      await Promise.all(
        (
          await readdir(dir)
        ).map((part) => walk(path.join(dir, part), options, results, ++level))
      );
    }
    return results;
  }
};
