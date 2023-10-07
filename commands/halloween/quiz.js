const Command = require('@structures/framework/Command');
const quizQuestions = require("@assets/quiz/questions.json");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Play a Halloween quiz!',
      options: [],
      category: "Halloween",
    })
  }

  async run(ctx) {
    const msg = await ctx.sendMsg({
      embeds: [new ctx.EmbedBuilder()
        .setTitle("Quiz your Halloween Knowledge!")
        .setDescription("Press the button below to start. This message will be edited with a question, and you will have 5 minutes to answer it.")
        .setThumbnail("https://discord.mx/QDUCdLqqwH.png")
        .setColor('#F7A02C')],
      components: [{ type:1, components: [ { type:2, style:3, label: "Start", custom_id: "quiz_start" } ] }] 
    });

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId == "quiz_start",
      time: 120_000,
      max: 1,
    });

    collector.on("end", (collected) => {
      if (collected.size) return;
      msg.edit({ components: [{ type:1, components: [ { type:2, style:3, label: "Start", custom_id: "quiz_start", disabled: true } ] }] });
    });

    collector.on("collect", (interaction) => {
      interaction.deferUpdate();
      this.startGame(ctx);
    });  
  }

  async startGame(ctx) {
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];

    let options = [...randomQuestion.answers], correctAnswer = null;
    options = shuffle(options);
    correctAnswer = options.findIndex((x) => x.correct)+1;

    const msg = await ctx.sendMsg(new ctx.EmbedBuilder()
    .setTitle('Quiz your Halloween Knowledge!')
    .setColor('#F7A02C')
    .setDescription(`Time runs out <t:${Math.floor((Date.now()+300*1e3)/1000)}:R>\n\n**Question:** ${randomQuestion.question}\n\n**Choices:**\n~~---------~~\n${options.map((x,i) => `**#${i+1}** ${x.name}`).join('\n')}`), {
      components: [{
        type:1, components: [
          { type:2, style:1, label: "#1", custom_id: "quiz_answer_1" },
          { type:2, style:1, label: "#2", custom_id: "quiz_answer_2" },
          { type:2, style:1, label: "#3", custom_id: "quiz_answer_3" },
          { type:2, style:1, label: "#4", custom_id: "quiz_answer_4" },
        ].slice(0,randomQuestion.answers.length)
      }],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId.slice(0,'quiz_answer_'.length) == "quiz_answer_",
      time: 300_000,
    });

    collector.on("end", (collected) => {
      if (collected.size) return;
      msg.edit({
        embeds: [
          new ctx.EmbedBuilder()
            .setTitle('Quiz your Halloween Knowledge!')
            .setColor('#F7A02C')
            .setThumbnail("https://discord.mx/QDUCdLqqwH.png")
            .setDescription("You ran out of time.")
        ],
        components: []
      });
    });

    collector.on("collect", (interaction) => {
      interaction.deferUpdate();
      const answer = Number(interaction.customId.slice(-1));

      msg.edit({
        embeds: [
          new ctx.EmbedBuilder()
            .setTitle('Quiz your Halloween Knowledge!')
            .setColor('#F7A02C')
            .setThumbnail("https://discord.mx/QDUCdLqqwH.png")
            .setDescription(`**Question:** ${randomQuestion.question}\n\n**Choices:**\n~~---------~~\n${options.map((x,i) => `**#${i+1}** ${x.name}`).join('\n')}\n\nYou choose answer **#${answer}** ${answer == correctAnswer ? "and that was **correct**! 🎉" : `but the correct answer was **#${correctAnswer}**. 😦`}`)
        ],
        components: [],
      })
    });
  }
}


function shuffle(array) {
  array = [...array];
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
