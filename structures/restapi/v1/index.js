const { Router } = require("express");
const Discord = require('discord.js');

const route = Router();

route.get('/stats', async (req, res, next) => {
  const guildCount = await req.manager.fetchClientValues('guilds.cache.size');
  const ping = await req.manager.fetchClientValues('ws.ping');
  const users = await req.manager.broadcastEval(() => this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));

  let shards = [];
  guildCount.map((count, shardId) => {
    shards.push({
      id: shardId, 
      guilds: count,
      users: users[shardId], 
      ping: ping[shardId],
    })
  });
  let redisStats = {
    version: {
      nodejs: process.version,
      discordjs: "v"+Discord.version,
    },
    shards: shards,
    total: {
      guilds: guildCount.reduce((servers, num) => num + servers, 0),
      users: users.reduce((users, num) => num + users, 0),
      ping: Math.round(ping.reduce((users, num) => num + users, 0) / ping.length)
    }
  };
  res.json(redisStats)
})

module.exports = route;