const microdb = require('nodejs-microdb');
const mockeries = new microdb({
  'file': `${__dirname}/../db/mockery.json`,
  'savetime': 0,
  'datatype': 1
});

module.exports = async function(interaction) {
  var responses = Object.values(mockeries.data);

  interaction.reply({
    content: responses.sort(() => (Math.random() > .5) ? 1 : -1)[0].text
  });
}