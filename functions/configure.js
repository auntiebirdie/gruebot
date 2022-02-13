const microdb = require('nodejs-microdb');
const db = new microdb({
  'file': `${__dirname}/../db/mockery.json`,
  'savetime': 0,
  'datatype': 1
});

module.exports = async function(interaction) {
  var response = "";

  switch (interaction.options.getSubcommand()) {
    case "add":
      var id = db.add({
        "text": interaction.options.getString('text'),
        "by": interaction.user.id
      });

      response = `Saved your mockery with the ID \`${id}\`!`;
      break;
    case "list":
      var mockeries = db.data;
      response = "```";

      for (let id in mockeries) {
        response += `${id}   ${db.data[id].text}\r\n`;

        if (response.length > 500) {
          response += "```";

          await interaction.followUp({
            content: response
          });

          response = "```";
        }
      }

      response += "```";
      break;
    case "remove":
      var id = interaction.options.getString('id').trim();
      var mockery = db.data[id];

      if (mockery) {
        db.del(id);
        response = `Your mockery has been removed!  For reference, it was:\r\n${mockery.text}`
      } else {
        response = `\`${id}\` doesn't exist.`
      }
      break;
    case "edit":
      var id = interaction.options.getString('id').trim();
      var mock = interaction.options.getString('text');
      var mockery = db.data[id];

      if (mockery) {
        db.add({
          "text": mock,
          "by": interaction.user.id
        }, id);

        response = `The mockery has been updated to say:\r\n${mock}`
      } else {
        response = `\`${id}\` doesn't exist.`
      }
      break;
  }

  db.save();

  interaction.editReply({
    content: response
  });
}