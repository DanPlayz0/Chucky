const Command = require('@structures/framework/Command');
const Canvas = require('canvas');
const guessable = [
  { name: "Snickers", imageItem: "https://discord.mx/1QYQVLhyUg.png" },
  { name: "Twix", imageItem: "https://discord.mx/b7R9I2cXfr.png" },
  { name: "Hershey Kiss", imageItem: "https://discord.mx/b3uBdDBbx5.png" },
  { name: "DOTS", imageItem: "https://discord.mx/R14IulXDJL.png" },
  { name: "Reese's", imageItem: "https://discord.mx/oaXhs1w7O2.png" },
  { name: "Starburst", imageItem: "https://discord.mx/4avjEM7lK7.png" },
  { name: "Candy Corn", imageItem: "https://discord.mx/ZGcF2rURaC.png" },
].map((x, i) => (x.id = i, x)).slice(0, 25);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: "Try to guess the candy!",
      options: [],
      category: "Halloween",
    })
  }

  async run(ctx) {
    const selection = guessable[Math.floor(Math.random() * guessable.length)];

    const img = await Canvas.loadImage(selection.imageItem);
    const canvas = Canvas.createCanvas(img.width + 30, img.height + 30);
    const context = canvas.getContext('2d');

    const silhouetteCanvas = Canvas.createCanvas(img.width, img.height);
    const silhouetteCtx = silhouetteCanvas.getContext('2d');
    silhouetteCtx.drawImage(img, 0, 0);
    this.silhouette(silhouetteCtx, 0, 0, img.width, img.height);
    context.drawImage(silhouetteCanvas, 15, 15);

    const time2Guess = Math.floor((Date.now() + 121000) / 1000);
    const guessImage = new ctx.EmbedBuilder()
      .setTitle("Guess the Candy")
      .setDescription(`Only the silhouette is visible. Press the buttons below to guess. Your guessing time runs out <t:${time2Guess}:R>!`)
      .setImage('attachment://hidden.png')
      .setColor("Orange")

    const msg = await ctx.sendMsg({
      embeds: [guessImage],
      files: [{ name: "hidden.png", attachment: canvas.toBuffer() }],
      components: Array.from({
        length: Number(String(guessable.length / 5).split('.')[0]) + (guessable.length % 5 == 0 ? 0 : 1)
      }, (_, pos) => ({
        type: 1,
        components: guessable.slice(5 * pos, 5 * pos + 5).map((x) => ({ type: 2, style: 1, label: x.name, custom_id: `guessitem_${x.id}` }))
      }))
    });


    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId.slice(0, "guessitem_".length) == 'guessitem_',
      time: 120_000,
      max: 1,
    });

    collector.on("end", (collected) => {
      if (collected.size) return;
      let embed2 = new ctx.EmbedBuilder()
        .setTitle("Yikes")
        .setColor("Red")
        .setDescription("You ran out of time to guess that candy. Run the command again to play again.");;

      guessImage.setImage(`attachment://${selection.name.replace(/[^a-zA-Z0-9]/g, '')}.png`);
      msg.edit({ embeds: [guessImage, embed2], components: [], files: [{ name: `${selection.name.replace(/[^a-zA-Z0-9]/g, '')}.png`, attachment: selection.imageItem }] });
    });

    collector.on("collect", (interaction) => {
      interaction.deferUpdate();
      const item = Number(interaction.customId.slice("guessitem_".length));
      const action = selection.id == item ? "success" : "fail";

      let actionEmbed = null;
      if (action == "success") {
        actionEmbed = new ctx.EmbedBuilder()
          .setTitle("Nice job")
          .setColor("Green")
          .setDescription(`Good job! You guessed the candy correctly within ${120 - (time2Guess - Math.floor(Date.now() / 1000))} seconds! Run the command again to play again.`);
      } else {
        actionEmbed = new ctx.EmbedBuilder()
          .setTitle("Yikes")
          .setColor("Red")
          .setDescription(`You guessed **${guessable.find(x => x.id == item).name}**. It was **${selection.name}**. Run the command again to try again.`);
      }

      const guessImage2 = new ctx.EmbedBuilder()
        .setTitle("Guess the Candy")
        .setDescription(`Only the silhouette is visible. Press the buttons below to guess. Your guessing time runs out <t:${time2Guess}:R>!`)
        .setImage(`attachment://${selection.name.replace(/[^a-zA-Z0-9]/g, '')}.png`)
        .setColor("Orange")

      msg.edit({ embeds: [guessImage2, actionEmbed], components: [], files: [{ name: `${selection.name.replace(/[^a-zA-Z0-9]/g, '')}.png`, attachment: selection.imageItem }] });
    });
  }

  silhouette(ctx, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = 0;
      data.data[i + 1] = 0;
      data.data[i + 2] = 0;
    }
    ctx.putImageData(data, x, y);
    return ctx;
  }
}