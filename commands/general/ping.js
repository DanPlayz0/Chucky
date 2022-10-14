const Command = require('@structures/framework/Command');
module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: "View the bot's ping!",
      options: [],
      category: "General",
    })
  }

  async run(ctx) {
    ctx.sendMsg(`Pong! Bot ping: \`${ctx.client.ws.ping}\` ms!`);
  }
}