const Command = require('@structures/framework/Command');
const Canvas = require('canvas');

const items = [
  { name: "Phoenix feathers", r: 247, g: 158, b: 0 },
  { name: "Eyeball", r: 250, g: 250, b: 250 },
  { name: "Tail of a rat", r: 120, g: 120, b: 120 },
  { name: "Dragon scale", r: 150, g: 87, b: 181 },
  { name: "Frog", r: 83, g: 173, b: 98 },
  { name: "Spider", r: -50, g: -50, b: -50 },
  { name: "Hair of a princess", r: 235, g: 228, b: 40 },
  { name: "Mushroom", r: 250, g: 0, b: 0 },
  { name: "Worm", r: 26, g: 163, b: 232 },
  { name: "Unicorn urin", r: 246, g: 136, b: 247 },
  { name: "Wishful thinking", r: 151, g: 172, b: 210 },
  { name: "Witch's spit", r: 4, g: 104, b: 76 },
  { name: "Iron axe", r: 89, g: 62, b: 49 },
].map((x, i) => (x.id = i, x)).slice(0, 25);

const convertToRgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const darken = (rgb, percent) => rgb.map(x=>Math.min(255, Math.max(0, x - x * (percent / 100))));
function replaceColorWithAnother(imageData, fromColor, toColor) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const pixelR = data[i], pixelG = data[i + 1], pixelB = data[i + 2];
    if (pixelR === fromColor[0] && pixelG === fromColor[1] && pixelB === fromColor[2]) {
      data[i] = toColor[0];
      data[i + 1] = toColor[1];
      data[i + 2] = toColor[2];
    }
  }
}

const differences = {
  second: 22,
  third: 35,
  highlight: 32
};
const hexRGB = ["#54ff6e", "#17b070", "#057863", "#e3ff87"].map(x=>convertToRgb(x));

let foregroundImage;
const cauldron = (addedItems = []) => {
  const canvas = Canvas.createCanvas(foregroundImage.width, foregroundImage.height);
  const context = canvas.getContext('2d');
  context.drawImage(foregroundImage, 0, 0);
  if (addedItems.length == 0) return canvas;

  let rgb = addedItems.reduce((p,c) => (p[0]+=c.r,p[1]+=c.g,p[2]+=c.b,p), [0,0,0]);
  rgb = rgb.map(x=>Math.round(x/(addedItems.length == 0 ? 1 : addedItems.length)));
  rgb = rgb.map(x=>x > 255 ? 255 : x < 25 ? 25 : x);
  
  const colors = Object.values(differences).map(x => darken(rgb, x));
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  hexRGB.map((x,i) => replaceColorWithAnother(imageData, x, [rgb, ...colors][i]))
  context.putImageData(imageData, 0, 0);

  return canvas;
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: "Brew a potion!",
      options: [],
      category: "Halloween",
    })
  }

  async run(ctx) {
    if(!foregroundImage) foregroundImage = await Canvas.loadImage("https://discord.mx/oOAzLOoMAs.png");

    let selectedItems = [];
    const embed = new ctx.EmbedBuilder()
      .setTitle("Brew a Potion!")
      .setDescription("Use the buttons below to customize the potion, each item will affect the color in its own way.")
      .setThumbnail("https://discord.mx/lXUljvrIWn.png")
      .setColor('#745693')
      .setImage('attachment://cauldron.png')

    const msg = await ctx.sendMsg({
      embeds: [embed],
      files: [ { name: "cauldron.png", attachment: cauldron([]).toBuffer() }, ],
      components: Array.from({
        length: Number(String(items.length / 5).split('.')[0]) + (items.length % 5 == 0 ? 0 : 1)
      }, (_, pos) => ({
        type: 1,
        components: items.slice(5 * pos, 5 * pos + 5).map((x) => ({ type: 2, style: 1, label: x.name, custom_id: `potionmaker_${x.id}` }))
      }))
    });

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId.slice(0, "potionmaker_".length) == 'potionmaker_',
      time: 120_000,
    });

    let lastClick = Date.now()-5*1e3;

    collector.on("end", (collected) => {
      msg.edit({ components: [] });
    });

    collector.on("collect", (interaction) => {
      if((Date.now() - lastClick) < 2000) return interaction.reply({ content: "Please wait 2 seconds before selecting another item to add.", ephemeral: true });
      interaction.deferUpdate();
      lastClick = Date.now();
      const potionItem = items.find(x=> x.id == Number(interaction.customId.slice("potionmaker_".length)));
      selectedItems.push(potionItem);
      msg.edit({ files: [ { name: "cauldron.png", attachment: cauldron(selectedItems).toBuffer() } ] })
    });
  }
}