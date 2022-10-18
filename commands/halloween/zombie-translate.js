const Command = require('@structures/framework/Command');
const axios = require('axios');

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
    let url = "https://zombietranslator.net/translate?ajax=true";
    url += `&language=${ctx.args.getString('language')}`;
    url += `&phrase=${encodeURIComponent(ctx.args.getString('phrase'))}`;

    const translation = await axios.get(url).then(x => x.data).catch((err) => null);
    
    return ctx.sendMsg(new ctx.EmbedBuilder()
      .setTitle('Zombie Translator')
      .setColor("#7F8D72")
      .setThumbnail("https://discord.mx/Wk7q6noUJm.png")
      .addFields([
        { name: "From", value: ctx.args.getString('language') == "english_to_zombie" ? "English" : "Zombie", inline: true },
        { name: "To", value: ctx.args.getString('language') == "english_to_zombie" ? "Zombie" : "English", inline: true },
        { name: "Input", value: ctx.args.getString('phrase'), inline: false },
        { name: "Translation", value: translation?.translated_text ?? "---- An error occurred ----", inline: false }
      ])
    )
  }
}