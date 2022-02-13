const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];

module.exports = async function(interaction) {
  if (interaction.customId) {
    var dates = {
      startDate: new Date(interaction.message.components[4].components[0].label.replace('Start Date: ', '')),
      endDate: new Date(interaction.message.components[4].components[1].label.replace('End Date: ', ''))
    };

	  var UTC = interaction.message.components[4].components[0].label.split('UTC').pop();

    if (interaction.customId == 'execute') {
      return GRUETIME();
    }
    if (interaction.customId == 'startDate') {
      var currentDate = 'startDate';
    } else if (interaction.customId == 'endDate') {
      var currentDate = 'endDate';;
    } else {
      var currentDate = interaction.message.components[4].components.find((component) => component.disabled).customId.split('_').pop();
    }

    switch (interaction.customId) {
      case 'year':
        dates[currentDate].setUTCFullYear(interaction.values[0]);
        break;
      case 'month':
        dates[currentDate].setUTCMonth(interaction.values[0]);
        break;
      case 'increaseDay':
        dates[currentDate].setUTCDate(dates[currentDate].getUTCDate() + 1);
        break;
      case 'decreaseDay':
        dates[currentDate].setUTCDate(dates[currentDate].getUTCDate() - 1);
        break;
      case 'hour':
        dates[currentDate].setUTCHours(interaction.values[0]);
        break;
    }
  } else {
	  var UTC = interaction.options.getString('utc') ? interaction.options.getString('utc') : '+1';

    var dates = {
      startDate: new Date(new Date().toString() + UTC),
      endDate: new Date(new Date().toString() + UTC)
    };

    var currentDate = 'startDate';

    dates.startDate.setUTCHours(0);
    dates.startDate.setMinutes(0);
    dates.startDate.setSeconds(0);

    dates.endDate.setUTCHours(23);
    dates.endDate.setMinutes(59);
    dates.endDate.setSeconds(59);
  }

  var response = {
    content: '<a:friendly_eyes:790216382351802379>',
    components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: 'summon_year',
          placeholder: 'Year',
          options: [{
            label: String(new Date().getUTCFullYear()),
            value: String(new Date().getUTCFullYear()),
            default: dates[currentDate].getUTCFullYear() == new Date().getUTCFullYear()
          }, {
            label: String(new Date().getUTCFullYear() - 1),
            value: String(new Date().getUTCFullYear() - 1),
            default: dates[currentDate].getUTCFullYear() == new Date().getUTCFullYear() - 1
          }]
        }]
      },
      {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'summon_month',
          placeholder: 'Month',
          options: months.map((month, i) => {
            return {
              label: month,
              value: String(i),
              default: i == dates[currentDate].getUTCMonth()
            };
          })
        }]
      }, {
        type: 1,
        components: [{
          type: 2,
          custom_id: 'summon_filler1',
          style: 2,
          label: 'Day:',
          disabled: true
        }, {
          type: 2,
          custom_id: 'summon_day',
          style: 1,
          label: String(dates[currentDate].getUTCDate()),
          disabled: true
        }, {
          type: 2,
          custom_id: 'summon_increaseDay',
          style: 2,
          label: '🔼'
        }, {
          type: 2,
          custom_id: 'summon_decreaseDay',
          style: 2,
          label: '🔽'
        }]
      },
      {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'summon_hour',
          placeholder: 'Hour (UTC' + UTC + ')',
          options: Array(24).fill('').map((val, i) => {
            return {
              label: String(`${i}:${currentDate == 'startDate' ? '00' : '59'}`),
              value: String(i),
              default: i == dates[currentDate].getUTCHours()
            }
          })
        }]
      }, {
        type: 1,
        components: [{
          type: 2,
          custom_id: 'summon_startDate',
          style: currentDate == 'startDate' ? 1 : 2,
          label: 'Start Date: ' + dates.startDate.getUTCFullYear() + '-' + (dates.startDate.getUTCMonth() + 1) + '-' + dates.startDate.getUTCDate() + ' ' + dates.startDate.getUTCHours() + ':00 UTC' + UTC,
          disabled: currentDate == 'startDate'
        }, {
          type: 2,
          custom_id: 'summon_endDate',
          style: currentDate == 'endDate' ? 1 : 2,
          label: 'End Date: ' + dates.endDate.getUTCFullYear() + '-' + (dates.endDate.getUTCMonth() + 1) + '-' + dates.endDate.getUTCDate() + ' ' + dates.endDate.getUTCHours() + ':59 UTC' + UTC,
          disabled: currentDate == 'endDate'
        }, {
          type: 2,
          custom_id: 'summon_execute',
          style: 3,
          label: 'SUMMON THE GRUE'
        }]
      }
    ]
  };

  if (interaction.customId) {
    interaction.update(response);
  } else {
    interaction.editReply(response);
  }

  async function GRUETIME() {
    var totalUsers = 0;

    var afterId = null;
    var page = 0;

    do {
      await interaction.guild.members.list({
        limit: 1000,
        after: afterId
      }).then((results) => {
        page = results.size;

        if (page > 0) {
          results.each((result) => {
            if (!result.user.bot) {
              totalUsers++;
            }
          });

          afterId = results.last().id;
        }
      });
    }
    while (page > 0);

    const channel = await interaction.guild.channels.fetch("788633174807805962");

    var startTimestamp = dates.startDate.getTime();
    var endTimestamp = dates.endDate.getTime();

    var availableBumps = [];
    var bumps = [];
    var firstBump = [Infinity, null];
    var lastBump = [0, null];
    var brokenDoubleBump = false;
    var users = {};
    var totalBumps = 0;

    var beforeId = null;
    var lastTimestamp = null;

    do {
      await channel.messages.fetch({
        limit: 100,
        before: beforeId
      }).then((results) => {
        page = results.size;

        if (page > 0) {
          results.each((result) => {
            if (result.createdTimestamp <= endTimestamp && result.createdTimestamp >= startTimestamp) {
              if (result.author.id == "735147814878969968" && result.embeds?.length > 0 && result.embeds[0].title == "THE BUMP IS AVAILABLE ONCE MORE") {
                availableBumps.push(result);
              } else if (result.author.id == interaction.client.user.id && (result.content.includes('THE BUMP IS AVAILABLE ONCE MORE') || result.content.includes("the bump is coming"))) {
                availableBumps.push(result);
              } else if (result.author.id == "302050872383242240" && result.embeds?.length > 0) {
                let id = availableBumps.length;
                let content = result.embeds[0].description;
                let user = content.match(/\<\@([0-9]+)\>/);
                let bump = null;

                if (!bumps[id]) {
                  bumps[id] = [];
                }

                if (content.includes('Bump done!')) {
                  if (user) {
                    bump = {
                      id: result.id,
                      user: user[1],
                      timestamp: result.createdTimestamp,
                      success: true
                    };

                    totalBumps++;

                    if (bump.timestamp < firstBump[0]) {
                      firstBump = [bump.timestamp, bump.id];
                    }

                    if (bump.timestamp > lastBump[0]) {
                      lastBump = [bump.timestamp, bump.id];
                    }

                    bumps[id].push(bump);
                  } else {
                    console.log('bump done but no user????', result);
                  }
                } else if (content.includes("I'm handling your command! :rage:")) {
                  bump = bumps[id][bumps[id].length - 1];

                  // if they are less than 2 seconds apart
                  if (bump && Math.abs(bump.timestamp - result.createdTimestamp) < 2000) {
                    bump.brokenDoubleBump = true;
                    brokenDoubleBump = bump.user;
                  }
                } else if (content.includes("Please wait another 120 minutes")) {
                  bump = {
                    id: result.id,
                    user: user[1],
                    timestamp: result.createdTimestamp,
                    success: false
                  };

                  bumps[id].push(bump);
                } else if (brokenDoubleBump && result.content.toLowerCase().trim() == '!d bump' && brokenDoubleBump != result.author.id) {
                  bump = {
                    id: result.id,
                    user: result.author.id,
                    timestamp: result.createdTimestamp,
                    success: false,
                    brokenDoubleBump: true
                  };

                  brokenDoubleBump = null;

                  bumps[id].push(bump);
                }
              }
            }
          });

          beforeId = results.last().id;
          lastTimestamp = results.last().createdTimestamp;
        }
      });
    }

    while (page > 0 && lastTimestamp >= startTimestamp);

    var auditLog = "";

    for (let num = availableBumps.length - 1; num >= 0; num--) {
      auditLog += `💀 ${new Date(availableBumps[num].createdTimestamp).toUTCString()} 💀\r\n`

      auditLog += `   https://discord.com/channels/${availableBumps[num].guild.id}/${availableBumps[num].channel.id}/${availableBumps[num].id}\r\n\r\n`;

      if (bumps[num] && bumps[num].length > 0) {
        let selfDoubleBumped = false;

        for (let bump of bumps[num]) {
          var points = bump.success ? 1 : 0;

          if (!users[bump.user]) {
            users[bump.user] = {
              id: bump.user,
              points: 0,
              doubleBumps: 0,
              selfDoubleBumps: 0,
              brokenDoubleBumps: 0,
              achievements: []
            };
          }

          let successfulBumps = bumps[num].filter((bmp) => bmp.success && Math.abs(bmp.timestamp - bump.timestamp) <= 10000);

          if (bump.success && successfulBumps.length > 1) {
            if (successfulBumps.filter((bmp) => bmp.user == bump.user).length > 1 && !selfDoubleBumped) {
              points = 5;
              users[bump.user].selfDoubleBumps++;
              selfDoubleBumped = true;
              auditLog += `@<${bump.user}> got a double bump with themselves?!\r\n   +5 points\r\n`;
            } else {
              points = 2;
              users[bump.user].doubleBumps++;
              auditLog += `@<${bump.user}> achieved a double bump!\r\n   +2 points\r\n`;
            }
          } else if (bump.brokenDoubleBump) {
            points = 5;
            users[bump.user].brokenDoubleBumps++;
            auditLog += `@<${bump.user}> broke a double bump!\r\n   +5 points\r\n`;
          } else if (bump.success) {
            auditLog += `@<${bump.user}> bumped!\r\n   +1 points\r\n`;
          }

          if (bump.success) {
            if (bump.id == firstBump[1] || bump.id == lastBump[1]) {
              if (bump.id == firstBump[1]) {
                users[bump.user].achievements.push('first bump');
                auditLog += "   2X FIRST BUMP BONUS\r\n";
              } else {
                users[bump.user].achievements.push('last bump');
                auditLog += "   2X LAST BUMP BONUS\r\n";
              }

              points *= 2;
            }

            auditLog += "\r\n";
          }

          users[bump.user].points += points;
        }
      }
    }

    var output = "Since the ";

    output += dates.startDate.getUTCDate() + (ordinals[dates.startDate.getUTCDate().toString().split('').pop()]) + " of " + months[dates.startDate.getUTCMonth()] + " " + ("0"+dates.startDate.getUTCHours()).slice(-2) + ":" + ("0"+dates.startDate.getUTCMinutes()).slice(-2);

    output += " to the ";

    output += dates.endDate.getUTCDate() + (ordinals[dates.endDate.getUTCDate().toString().split('').pop()]) + " of " + months[dates.endDate.getUTCMonth()] + " " + ("0"+dates.endDate.getUTCHours()).slice(-2) + ":" + ("0"+dates.endDate.getUTCMinutes()).slice(-2);

    output += "\r\n\r\n";

    users = await Promise.all(Object.entries(users).filter((user) => user[1].points > 0).map((user) => {
      return interaction.guild.members.fetch(user[0]).then((member) => {
        user[1].displayName = member.displayName;

        auditLog = auditLog.replace(new RegExp('@<' + user[0] + '>', 'g'), member.displayName);

        return user[1];
      });
    }));

    users.sort((a, b) => b.points - a.points);

    let rank = 1;

    for (let i = 0, len = users.length; i < len; i++) {
      users[i].rank = rank;

      if (i < len - 1) {
        if (users[i + 1].points == users[i].points) {
          continue;
        }
      }

      let tmp = users.filter((score) => score.rank == rank).map((score) => `${score.displayName}`).join(', ');

      output += `#${rank} - ${tmp} with **${users[i].points}** points\r\n`

      rank++;
    }

    output += "\r\n";

    output += "The server has been bumped a total of " + totalBumps + " out of the " + Math.round((endTimestamp - startTimestamp) / (60 * 60 * 1000) / 2) + " possible times, including the exact hours of a day. Out of " + totalUsers + ", a total of " + Object.keys(users).length + " people participated.\r\n\r\n";

    output += "**Special point recipients this week were:**\r\n";

    users.reverse();

    for (let id in users) {
      let user = users[id];

      if (user.doubleBumps > 0) {
        user.achievements.push(user.doubleBumps + ' double bumps');
      }

      if (user.brokenDoubleBumps > 0) {
        user.achievements.push(user.brokenDoubleBumps + ' broken double bumps');
      }

      if (users.selfDoubleBumps > 0) {
        user.achievements.push(user.selfDoubleBumps + ' self double bumps');
      }

      if (user.achievements.length > 0) {
        output += `${user.displayName} - ${user.achievements.join(', ')}\r\n`;
      }
    }

    interaction.update({
      content: output,
      components: [],
      files: [{
        attachment: new Buffer.from(auditLog, "utf-8"),
        name: 'log.txt'
      }]
    });
  }
}
