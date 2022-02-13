const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/secrets.yaml`, 'utf8'));

const privilegedRoles = [
  "790730007022403584", // Head Administrator
  "785997517748961331", // Administrator
  "789596793716604989", // Moderator
  "933416538306916462", // HR-Bitches
  "800774317654540298" // Tech Wizard
].map((role) => {
  return {
    id: role,
    type: 1,
    permission: true
  };
});

const commands = [{
  name: "summon",
  description: "Summon the grue.",
  options: [
    {
      "name": "utc",
      "description": "Defaults to +1",
      "type": 3
    }
  ],
  default_permission: false,
  permissions: privilegedRoles
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
  }],
  default_permission: false,
  permissions: privilegedRoles
}, {
  name: "echo",
  description: "let me be your mouthpiece",
  options: [{
    name: "text",
    description: "what do you want me to say?",
    type: 3,
    required: true
  }],
  default_permission: false,
  permissions: privilegedRoles
}, {
  name: "spooky",
  description: "ooOoOOoooOo",
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
).then(async (response) => {
  for (let command of response.data) {
    let cmd = commands.find((cmd) => cmd.name == command.name);

    if (cmd.permissions) {
      var res = await axios.put(`https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/guilds/${secrets.GUILD_ID}/commands/${command.id}/permissions`, {
        permissions: cmd.permissions
      }, headers);

      console.log(res.status);
    }
  }
}).catch((err) => {
  console.log(err);
});
