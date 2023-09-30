const conf = require("./config.json");
const dbConnectionString = conf.dbConnectionString;
const webServer = conf.webServer;
const locale = conf.locale;
const errorFile = conf.errorFile;
const combineFile = conf.combineFile;
const environment = conf.environment;
const corsConf = conf.cors;
const bitacoraQueue = conf.bitacoraQueue;
const redis = conf.redis;

module.exports = () => {
  return {
    dbConnectionString,
    webServer,
    locale,
    errorFile,
    combineFile,
    environment,
    bitacoraQueue,
    redis,
    corsConf,
  };
};
