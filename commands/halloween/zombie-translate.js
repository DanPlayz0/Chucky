const Command = require('@structures/framework/Command');
const { zombishMapping, zombishRevMapping, validZombish } = require('@assets/zombie-translator/characters');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Translate to or from Zombie.',
      options: [
        {
          type: 3,
          name: "language",
          description: "Which language to translate into?",
          choices: [
            { name: "English to Zombie", value: "english_to_zombie" },
            { name: "Zombie to English", value: "zombie_to_english" },
          ],
          required: true,
        },
        {
          type: 3,
          name: "phrase",
          description: "The phrase to translate",
          required: true,
          max_length: 800,
          min_length: 1,
        }
      ],
      category: "Halloween",
    })
  }

  async run(ctx) {
    const langOption = ctx.args.getString('language'), phraseOption = ctx.args.getString('phrase');

    let phrase = "";
    if (langOption == "english_to_zombie") {
      for (let char of phraseOption.split('')) phrase += zombishMapping.hasOwnProperty(char) ? zombishMapping[char] : char;
    } else if (langOption == "zombie_to_english") {
      let stringPair = [], first = true, pair = "";
      for (let s of phraseOption.split('')) {
        if (validZombish.includes(s)) {
          if (first) { pair = s; first = false; }
          else {
            pair += s;
            stringPair.push(pair);
            pair = ""; first = true;
          }
        } else {
          if(pair != "") stringPair.push(pair);
          pair = ""; first = true; stringPair.push(s);
        }
      }
      for (let pair of stringPair) phrase += zombishRevMapping.hasOwnProperty(pair) ? zombishRevMapping[pair] : pair;
    }
    
    return ctx.sendMsg(new ctx.EmbedBuilder()
      .setTitle('Zombie Translator')
      .setColor("#7F8D72")
      .setThumbnail("https://discord.mx/Wk7q6noUJm.png")
      .addFields([
        { name: "From", value: langOption == "english_to_zombie" ? "English" : "Zombie", inline: true },
        { name: "To", value: langOption == "english_to_zombie" ? "Zombie" : "English", inline: true },
        { name: "Translation", value: phrase || "---- An error occurred ----", inline: false }
      ])
    )
  }
}