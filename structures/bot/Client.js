const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = class BotClient extends Discord.Client {
  constructor(options) {
    super(options);

    // Configuration
    this.config = require('@root/config');

    // Collections
    for (const name of ["commands", "events", "cooldowns"]) this[name] = new Discord.Collection();

    // Packages
    this.discord = Discord;
    this.fs = fs;
    
    // Miscelaneous
    this.framework = {
      interactionContext: require("@structures/framework/ContextInteraction"),
    }
    this.database = new (require('./DatabaseManager.js'))(this);
    this.webhooks = new (require('@structures/webhooks/WebhookManager.js'))(this);
    this.loader = new (require('./Loader.js'))(this);

    this.database.init();
    this.loader.start();
  }
}