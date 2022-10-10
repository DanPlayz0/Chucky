module.exports = {
  token: "DISCORD_BOT_TOKEN",

  mongo_uri: "mongodb://username:password@localhost:27017/chucky?authSource=admin&retryWrites=true&ssl=false",

  webhooks: {
    shard: { id: "", token: "" },
    error: { id: "", token: "" },
    command: { id: "", token: "" },
    guilds: { id: "", token: "" },
  }
}