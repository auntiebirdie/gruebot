const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];

module.exports = async function(interaction) {
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

  if (interaction.options.getString('start')) {
    var startDate = new Date(interaction.options.getString('start'));
  } else {
    var startDate = new Date();

    startDate.setDate(startDate.getDate() - startDate.getDay() - 1);
  }

  if (interaction.options.getString('end')) {
    var endDate = new Date(interaction.options.getString('end'));
  } else {
    var endDate = new Date();

    startDate.setDate(startDate.getDate() - 1);
  }

  var startTimestamp = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
  var endTimestamp = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

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
            if (result.author.id == "735147814878969968" || (result.author.id == interaction.client.user.id && result.content.includes('THE BUMP IS AVAILABLE ONCE MORE'))) {
              availableBumps.push(result.createdTimestamp);
            } else if (result.author.id == "302050872383242240" && result.embeds?.length > 0) {
              let id = availableBumps.length;
              let content = result.embeds[0].description;
              let user = content.match(/\<\@([0-9]+)\>/);

              if (!bumps[id]) {
                bumps[id] = [];
              }

              if (content.includes('Bump done!')) {
                if (user) {
                  let bump = {
                    id: result.id,
                    user: user[1],
                    timestamp: result.createdTimestamp,
                    success: true
                  };

                  totalBumps++;

                  bumps[id].push(bump);

                  if (bump.timestamp < firstBump[0]) {
                    firstBump = [bump.timestamp, bump.id];
                  }

                  if (bump.timestamp > lastBump[0]) {
                    lastBump = [bump.timestamp, bump.id];
                  }
                } else {
                  console.log('bump done but no user????', result);
                  throw err;
                }
              } else if (content.includes("I'm handling your command! :rage:")) {
                let bump = bumps[id][bumps[id].length - 1];

                // if they are less than 2 seconds apart
                if (Math.abs(bump.timestamp - result.createdTimestamp) < 2000) {
                  bump.brokenDoubleBump = true;

                  brokenDoubleBump = bump.user;
                }
              } else if (content.includes("Please wait another 120 minutes")) {
                let bump = {
                  id: result.id,
                  user: user[1],
                  timestamp: result.createdTimestamp,
                  success: false
                };

                bumps[id].push(bump);
              } else if (brokenDoubleBump && result.content.toLowerCase().trim() == '!d bump' && brokenDoubleBump != result.author.id) {
                let bump = {
                  id: result.id,
                  user: result.author.id,
                  timestamp: result.createdTimestamp,
                  success: false,
                  brokenDoubleBump: true
                };

                bumps[id].push(bump);

                brokenDoubleBump = null;
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

  for (let id in availableBumps) {
    if (bumps[id].length > 0) {
      let selfDoubleBumped = false;

      for (let bump of bumps[id]) {
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

        let successfulBumps = bumps[id].filter((bmp) => bmp.success);

        if (bump.success && successfulBumps.length > 1) {
          if (successfulBumps.filter((bmp) => bmp.user == bump.user).length > 1 && !selfDoubleBumped) {
            points = 5;
            users[bump.user].selfDoubleBumps++;
            selfDoubleBumped = true;
          } else {
            points = 2;
            users[bump.user].doubleBumps++;
          }
        } else if (bump.brokenDoubleBump) {
          points = 5;
          users[bump.user].brokenDoubleBumps++;
        }

        if (bump.success) {
          if (bump.id == firstBump[1] || bump.id == lastBump[1]) {
            if (bump.id == firstBump[1]) {
              users[bump.user].achievements.push('first bump');
            } else {
              users[bump.user].achievements.push('last bump');
            }

            points *= 2;
          }
        }

        users[bump.user].points += points;
      }
    }
  }

  var output = "Since the ";

  output += startDate.getDate() + (ordinals[startDate.getDate().toString().split('').pop()]) + " of " + months[startDate.getMonth()];

  output += " to yesterday, the ";

  output += endDate.getDate() + (ordinals[endDate.getDate().toString().split('').pop()]) + " of " + months[endDate.getMonth()];

  output += "\r\n\r\n";

  users = await Promise.all(Object.entries(users).filter((user) => user[1].points > 0).map((user) => {
    return interaction.guild.members.fetch(user[0]).then((member) => {
      user[1].displayName = member.displayName;

      return user[1];
    });
  }));

  users.sort((a, b) => b.points - a.points);

  let rank = 1;

  for (let i = 0, len = Math.min(10, users.length); i < len; i++) {
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

  output += "The server has been bumped a total of " + totalBumps + " out of the " + availableBumps.length + " possible times, not including the exact hours of a day. Out of " + totalUsers + ", a total of " + Object.keys(users).length + " people participated.\r\n\r\n";

  output += "**Special point recipients this week were:**\r\n";

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

  interaction.editReply({
    content: output
  });
}
