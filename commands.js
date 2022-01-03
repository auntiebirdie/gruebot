const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/secrets.yaml`, 'utf8'));

const commands = [{
  name: "summon",
  description: "Summon the grue.",
  options: [{
      "name": "start",
      "description": "Start date defaults to last Saturday",
      "type": 3
    },
    {
      "name": "end",
      "description": "End date defaults to yesterday",
      "type": 3
    }
  ],
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
}, {
  name: "configure",
  description: "Tell the grue what to do.",
  options: [{
    name: "mockery",
    description: "huehuehue",
    type: 2,
    options: [{
      name: "list",
      description: "View the list of mockeries",
      type: 1
    }, {
      name: "remove",
      description: "Remove a mockery",
      type: 1,
      options: [{
        "name": "id",
        "description": "The ID of the mockery to remove",
        "type": 3,
        "required": true
      }]
    }, {
      name: "add",
      description: "Add a new mockery",
      type: 1,
      options: [{
        "name": "text",
        "description": "The text you want to mock with",
        "type": 3,
        "required": true
      }]
    }, {
      name: "edit",
      description: "Edit a mockery",
      type: 1,
      options: [{
        "name": "id",
        "description": "The ID of the mockery to edit",
        "type": 3,
        "required": true
      }, {
        "name": "text",
        "description": "The new text you want to mock with",
        "type": 3,
        "required": true
      }]
    }],
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
