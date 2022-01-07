const Flickr = require('flickr-sdk');
const yaml = require('js-yaml');
const fs = require('fs');

const secrets = yaml.load(fs.readFileSync(`${__dirname}/../secrets.yaml`, 'utf8'));

module.exports = async function(interaction) {
  const flickr = new Flickr(secrets.FLICKR_API_KEY);
  var foundPhotos = [];

  do {
    await flickr.photos.search({
      tags: 'spooky,creepy,scary'
    }).then(function(res) {
      foundPhotos = res.body.photos.photo;

      if (foundPhotos.length > 0) {
        var photo = foundPhotos.sort(() => Math.random() > .5 ? 1 : -1)[0];

        interaction.editReply({
          content: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`
        });
      }
    });
  } while (foundPhotos.length == 0)
};
