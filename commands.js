const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/secrets.yaml`, 'utf8'));

const commands = [{
  name: "summon",
  description: "Summon the grue.",
  default_permission: false,
  permissions: [{
    id: "922956415134470155",
    type: 1,
    permission: true
  }, {
    id: "907692992058511370",
    type: 1,
    permission: true
  }]
}];

const headers = {
  headers: {
    "Authorization": `Bot ${secrets.BOT_TOKEN}`
  }
};

axios.put(
  `https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/commands`,
  commands,
  headers
).then((response) => {
  for (let command of response.data) {
    let cmd = commands.find((cmd) => cmd.name == command.name);

    if (cmd.permissions) {
      axios.put(`https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/guilds/${secrets.GUILD_ID}/commands/${command.id}/permissions`, {
        permissions: cmd.permissions
      }, headers);
    }
  }
}).catch((err) => {
  console.log(err);
});
