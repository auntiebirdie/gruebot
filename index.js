exports.gruebot = async (req, res) => {
  if (req.get('X-CloudScheduler')) {
    require(`./cron/${req.get('X-CloudScheduler-JobName')}.js`)(req, res);
  }
}
