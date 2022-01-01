const scheduler = require('@google-cloud/scheduler');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/secrets.yaml`, 'utf8'));

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

client.login(secrets.BOT_TOKEN);

client.on('interactionCreate', async (interaction) => {
  try {
    await interaction.deferReply();

    require(`./functions/${interaction.commandName}.js`)(interaction);
  } catch (err) {
    console.error(err);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.id == "302050872383242240" && message.embeds.length > 0 && message.embeds[0].description.includes('Bump done!')) {
    message.react('🔔');

    const client = new scheduler.CloudSchedulerClient();
    const schedule = new Date();

    schedule.setMinutes(schedule.getMinutes() + 120);

    await client.updateJob({
      job: {
        name: client.jobPath("bot-central", "us-central1", "bumpminder"),
        schedule: [
          schedule.getMinutes(),
          schedule.getHours(),
          schedule.getDate(),
          schedule.getMonth() + 1,
          '*'
        ].join(' ')
      },
      updateMask: {
        paths: ['schedule']
      }
    });
  }
});

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', async () => {
  console.log(`a grue is online!`);
});

module.exports = client;
