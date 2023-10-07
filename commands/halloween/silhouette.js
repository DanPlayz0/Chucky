const Command = require('@structures/framework/Command');
const Canvas = require('canvas');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: "Silhouette an image!",
      options: [
        {type: 3, name: "url", required: true, description: "The url to silhouettify"}
      ],
      category: "Halloween",
    })
  }

  async run(ctx) {
    if(!/^https\:\/\//.test(ctx.args.getString('url'))) return ctx.sendMsg("The url must start with `https://`");
    if(/localhost/.test(ctx.args.getString('url'))) return ctx.sendMsg("The url must not include `localhost`");

    const img = await Canvas.loadImage(ctx.args.getString('url'));
    const canvas = Canvas.createCanvas(img.width + 30, img.height + 30);
    const context = canvas.getContext('2d');

    const silhouetteCanvas = Canvas.createCanvas(img.width, img.height);
    const silhouetteCtx = silhouetteCanvas.getContext('2d');
    silhouetteCtx.drawImage(img, 0, 0);
    this.silhouette(silhouetteCtx, 0, 0, img.width, img.height);
    context.drawImage(silhouetteCanvas, 15, 15);
    
    const msg = await ctx.sendMsg({
      files: [
        { name: "image.png", attachment: ctx.args.getString('url') },
        { name: "hidden.png", attachment: canvas.toBuffer() },
      ],
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
