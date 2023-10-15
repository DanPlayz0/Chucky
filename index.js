(async () => {
  // Bot Stuff
  const { ShardingManager } = require('discord.js');
  const config = require('./config.js');
  
  const axios = require('axios');
  const gatewaySettings = await axios.get('https://discord.com/api/gateway/bot', {headers:{Authorization: "Bot "+config.token}}).then(res=>res.data).catch(res=>null);

  let totalShards = 'auto';
  const guildsPerShard = 950, multipleOf = 3;
  if (gatewaySettings.shards) totalShards = Math.ceil((gatewaySettings.shards * (1_000 / guildsPerShard)) / multipleOf) * multipleOf;

  if (gatewaySettings?.session_start_limit?.remaining && totalShards != 'auto') {
    if(totalShards > gatewaySettings.session_start_limit.remaining)
      await new Promise((resolve) => setTimeout(resolve, gatewaySettings.session_start_limit.reset_after));
  }

  let manager = new ShardingManager('./bot.js', { totalShards, token: config.token });
  manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} launched`));
  await manager.spawn();
  
  for (let event of ['SIGINT', 'SIGTERM']) process.on(event, () => {
    manager.broadcastEval((c)=>c.stop())
    database.raw.close();
    redis.disconnect();
    process.exit(0);
  });

  // HTTP Services
  for (let event of ['uncaughtException', 'unhandledRejection']) process.on(event, (err) => {
    console.error(err);
  })

  const API = require('./structures/restapi/index');
  const api = new API(config, manager);
  api.listen(config.restapi.port);
})()