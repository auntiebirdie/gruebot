const scheduler = require('@google-cloud/scheduler');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/secrets.yaml`, 'utf8'));

const microdb = require('nodejs-microdb');
const mockeries = new microdb({
  'file': `${__dirname}/db/mockery.json`,
  'savetime': 0,
  'datatype': 1
});

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
  if (message.author.id == "302050872383242240" && message.embeds.length > 0) {
    if (message.embeds[0].description.includes('Bump done!')) {
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
    } else if (message.embeds[0].description.includes("Please wait")) {
      if (Math.random() * 100 > 90) {
        var responses = Object.values(mockeries.data);

        message.reply({
          content: responses.sort(() => (Math.random() > .5) ? 1 : -1)[0]
        });
      }
    }
  }
});

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', async () => {
  const channel = await client.channels.fetch("788633174807805962");

  var page = 0;
  let beforeId = null;
  let lastBump = null;

  do {
    await channel.messages.fetch({
      limit: 10,
      before: beforeId
    }).then((results) => {
      page = results.size;

      if (page > 0) {
        results.each((result) => {
          if (result.author.id == "302050872383242240" && result.embeds.length > 0 && result.embeds[0].description.includes('Bump done!')) {
            if (!lastBump || lastBump.createdTimestamp < result.createdTimestamp) {
              lastBump = result;
            }
          }
        });
      }
    });
  } while (!lastBump && page > 0);

  if (lastBump) {
    lastBump.react('🔔');

    const client = new scheduler.CloudSchedulerClient();
    const schedule = new Date(lastBump.createdTimestamp);

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

  console.log('a grue is online!');
});

module.exports = client;
