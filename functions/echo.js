module.exports = async function(interaction) {
  var message = interaction.options.getString('text').trim();

  interaction.channel.send({
    content: message
  });

  interaction.guild.channels.fetch('790331620522459186').then((channel) => {
    channel.send({
      content: ' ',
      embeds: [{
        description: `<@${interaction.user.id}> made me say in <#${interaction.channel.id}>\r\n\r\n${message}`
      }]
    });
  });
};
