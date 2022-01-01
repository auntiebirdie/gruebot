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
      content: '**THE BUMP IS AVAILABLE ONCE MORE, <@&926215525686730842>**\r\n\r\nWho will be the first to obtain the bump? A competitive, bumping fiend? No, maybe someone else, someone who has been lurking very quietly for quite some time? Or possibly that person who has never spoken but randomly checked this channel? We might see, we might not (who has eyes nowadays, anyhow?)'
    });
  });
}
