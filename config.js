const private = require('./config-private.js');
module.exports = {
  // Bot Token
  token: private.token,

  // Bot Administators (Access to Admin Dash & System Commands)
  admins: ['209796601357533184', '813875382972973088'],
  
  // Database Crap (MongoDB & Redis)
  mongo_uri: private.mongo_uri,
  
  // Support server. (For the "dashboard.example/join")
  supportServerInvite: "https://discord.gg/KkS6yP8",
  
  // Bot Logging (Webhooks)
  webhooks: [
    { name: "shard", id: private.webhooks?.shard?.id, token: private.webhooks?.shard?.token },
    { name: "error", id: private.webhooks?.error?.id, token: private.webhooks?.error?.token },
    { name: "command", id: private.webhooks?.command?.id, token: private.webhooks?.command?.token },
    { name: "guilds", id: private.webhooks?.guilds?.id, token: private.webhooks?.guilds?.token },
  ],

}