const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILD_MEMBERS]
});

module.exports = function(req, res) {
  client.login(process.env.BOT_TOKEN);

  client.on('ready', async () => {
    const channel = await client.channels.fetch("788633174807805962");

    channel.send({
	    content: '**better watch out, <@&926671218801774632>, the bump is coming**'
    });
  });
}
