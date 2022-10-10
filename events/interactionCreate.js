const Event = require('@structures/framework/Event');
const Context = require('@structures/framework/ContextInteraction');
module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
    });
  }

  async run(client, interaction) {
    if(interaction.type == 4) this.autoComplete(client, interaction);
    if(interaction.type == 2) this.slashCommand(client, interaction);
  }

  async autoComplete(client, interaction) {
    const cmd = client.commands.get(interaction.commandName);
    if(!cmd) return interaction.respond([]);

    const ctx = new Context({client, interaction, commandType: 'interaction'});
    return cmd._entrypoint(ctx, 'autocomplete');
  }

  async slashCommand(client, interaction) {
    const ctx = new Context({client, interaction, commandType: 'interaction'});

    // Command Cooldown System
    const now = Date.now(), timestamps = client.cooldowns, cooldownAmount = 4500;
    if (timestamps.has(ctx.author.id)) {
      const expirationTime = timestamps.get(ctx.author.id) + cooldownAmount;
  
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return ctx.interaction.reply({content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the command.`, ephemeral: true})
      }
    }
    timestamps.set(ctx.author.id, now);
    setTimeout(() => timestamps.delete(ctx.author.id), cooldownAmount);

    const command = client.commands.get(interaction.commandName);
    if(!command) return;
    client.webhooks.command.send({content: `${ctx.author.tag} \`${ctx.author.id}\` used **${interaction.commandName}** in ${interaction.guild.name} \`${interaction.guild.id}\` ||/${interaction.commandName} ${interaction.options._hoistedOptions.map(m => `${m.name}:${m.value}`).join(' ')}`.slice(0,1995)+'||', allowedMentions: { parse: [] } })
    return command._entrypoint(ctx, 'slash');
  }
}