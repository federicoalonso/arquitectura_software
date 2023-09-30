const conf = require("./config.json");
const logQueue = conf.logQueue;
const emailQueue = conf.emailQueue;
const redis = conf.redis;
const smtp = conf.smtp;

module.exports = () => {
  return {
    logQueue,
    emailQueue,
    redis,
    smtp,
  };
};
