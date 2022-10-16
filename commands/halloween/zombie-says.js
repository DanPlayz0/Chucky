const Command = require('@structures/framework/Command');
const Canvas = require('canvas');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Play a game of Zombie Says (Simon Says)',
      options: [
        { 
          type: 3,
          name: "show_intro",
          description: "Should the instructions prompt show?",
          choices: [
            {name: "Yes", value: "show"},
            {name: "No (Bypass)", value: "bypass"},
          ]
        }
      ],
      category: "Halloween",
    })
  }

  async run(ctx) {
    if(ctx.args.getString('show_intro') == "bypass") return this.startGame(ctx);
    const msg = await ctx.sendMsg(new ctx.EmbedBuilder()
      .setTitle('Zombie Says')
      .setColor("#7F8D72")
      .setThumbnail("https://discord.mx/Wk7q6noUJm.png")
      .setDescription([
        'Please read the following (within two minutes) and click the green button once your ready and understand the game.',
        '',
        'This is a simplified version of simon says. I will give a list of colors and then edit them away. Once I\'ve edited them, you will have to click the buttons in the **correct** order.',
        '',
        'For the next time you play, if you\'d like to skip this menu (the instructions), use this command again with the `show_intro` option and set it to `No (Bypass)`.',
      ].join('\n')),
    { components: [{ type:1, components: [ { type:2, style:3, label: "Start", custom_id: "zombiesays_start" } ] }] });

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId == "zombiesays_start",
      time: 120_000,
      max: 1,
    });

    collector.on("end", (collected) => {
      if (collected.size) return;
      msg.edit({ components: [{ type:1, components: [ { type:2, style:3, label: "Start", custom_id: "zombiesays_start", disabled: true } ] }] });
    });

    collector.on("collect", (interaction) => {
      interaction.deferUpdate();
      this.startGame(ctx);
    });
  }

  createCanvas(buttonPattern, guessMode = false, guessed = []) {
    let canvas = Canvas.createCanvas(400, 311), context = canvas.getContext("2d");
    let y = 20;
    context.fillStyle = "#36393F";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const patterns = {
      0: { color: "#FFFFFF", name: "??????" },
      1: { color: "#D83C3E", name: "Red" },
      2: { color: "#5865F2", name: "Blue" },
      3: { color: "#2D7D46", name: "Green" },
    };
    
    for (let i = 0; i <= buttonPattern.length-1; i++) {
      context.fillStyle = "#202225";
      context.fillRect(11, y, 380, 30);

      let pattern = guessMode ? patterns[0] : patterns[buttonPattern[i]];
      let stepText = pattern.name;

      if(guessMode) {
        if(guessed.length == buttonPattern.length) {
          pattern = patterns[buttonPattern[i]];
          stepText = pattern.name;
          stepText += guessed[i] == buttonPattern[i] ? " Correct" : " Incorrect";
        } else if (guessed.length >= i+1) {
          stepText = "Guessed";
        }
      }

      context.textAlign = 'center';
      context.font = "12px Arial";
      context.fillStyle = pattern.color;
      context.fillText(stepText, 65, y + 20);
      context.fillRect(11+190, y, 190, 30);

      y += 40;
    }
    return canvas;
  }

  async startGame(ctx) {
    const buttonPattern = Array.from({length: 7}, () => Math.floor(Math.random() * (3- 1+ 1) + 1));

    const canvasSteps = this.createCanvas(buttonPattern, false, []);

    const msg = await ctx.sendMsg(new ctx.EmbedBuilder()
    .setTitle('Zombie Says')
    .setColor("#7F8D72")
    .setDescription(`Memorize the steps in the image. Time runs out <t:${Math.floor((Date.now()+1e3*15)/1000)}:R>`)
    .setImage("attachment://zombiesays-steps.png"), {
      files: [{name: "zombiesays-steps.png", attachment: canvasSteps.toBuffer() }],
      components: [{
        type:1, components: [
          { type:2, style:4, label: "Red", custom_id: "zombiesays_1", disabled: true },
          { type:2, style:1, label: "Blue", custom_id: "zombiesays_2", disabled: true },
          { type:2, style:3, label: "Green", custom_id: "zombiesays_3", disabled: true },
        ]
      }],
    });

    const canvasStepsBlank = this.createCanvas(buttonPattern, true, []);

    setTimeout(() => {
      ctx.sendMsg(new ctx.EmbedBuilder()
        .setTitle('Zombie Says')
        .setColor("#7F8D72")
        .setDescription("Now replicate the pattern. Good luck!")
        .setImage("attachment://zombiesays-steps-blank.png"), {
          files: [{name: "zombiesays-steps-blank.png", attachment: canvasStepsBlank.toBuffer() }],
          components: [{ 
            type:1, components: [ 
              { type:2, style:4, label: "Red", custom_id: "zombiesays_1", disabled: false },
              { type:2, style:1, label: "Blue", custom_id: "zombiesays_2", disabled: false },
              { type:2, style:3, label: "Green", custom_id: "zombiesays_3", disabled: false },
            ]
          }],
      })
    }, 15000)

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        ["zombiesays_1", "zombiesays_2", "zombiesays_3"].includes(inter.customId),
      time: 600_000,
    });

    collector.on("end", (collected) => {
      if (collected.size) return;
      msg.edit({
        embeds: [
          new ctx.EmbedBuilder()
            .setTitle('Zombie Says')
            .setColor("#7F8D72")
            .setThumbnail("https://discord.mx/Wk7q6noUJm.png")
            .setDescription("You ran out of time.")
        ],
        components: []
      });
    });

    const guessed = [];
    collector.on("collect", (interaction) => {
      interaction.deferUpdate();
      guessed.push(interaction.customId.slice(-1));
      const canvasStepsGuessed = this.createCanvas(buttonPattern, true, guessed);
      if(guessed.length < buttonPattern.length) {
        ctx.sendMsg(new ctx.EmbedBuilder()
          .setTitle('Zombie Says')
          .setColor("#7F8D72")
          .setDescription("Now replicate the pattern. Good luck!")
          .setImage("attachment://zombiesays-steps-progress.png"), 
          { files: [{name: "zombiesays-steps-progress.png", attachment: canvasStepsGuessed.toBuffer() }], }
        )
        return;
      }
      let incorrectGuesses = 0;
      for(let i = 0; i<=buttonPattern.length-1; i++) incorrectGuesses += guessed[i] == buttonPattern[i] ? 0 : 1;

      let message = "Nice job! You got them all correct";
      if (incorrectGuesses == 1) message = "You are pretty damn good, you only got one wrong. Look at the image to see your mistake.";
      if (incorrectGuesses == 2) message = "You got 2 wrong but thats okay. Look at the image to see your mistakes.";
      if (incorrectGuesses > 2) message = "Memorization is a good skill, you should learn it. Look at the image to see your mistakes.";

      ctx.sendMsg(new ctx.EmbedBuilder()
        .setTitle('Zombie Says')
        .setColor("#7F8D72")
        .setDescription(message)
        .setImage("attachment://zombiesays-steps-guessed.png"), {
          files: [{name: "zombiesays-steps-guessed.png", attachment: canvasStepsGuessed.toBuffer() }],
          components: [{ 
            type:1, components: [ 
              { type:2, style:4, label: "Red", custom_id: "zombiesays_1", disabled: true },
              { type:2, style:1, label: "Blue", custom_id: "zombiesays_2", disabled: true },
              { type:2, style:3, label: "Green", custom_id: "zombiesays_3", disabled: true },
            ]
          }],
        });
    });
  }
}