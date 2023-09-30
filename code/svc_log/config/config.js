const conf = require("./config.json");
const dbConnectionString = conf.dbConnectionString;
const webServer = conf.webServer;
const locale = conf.locale;
const errorFile = conf.errorFile;
const combineFile = conf.combineFile;
const environment = conf.environment;
const corsConf = conf.cors;
const logQueue = conf.logQueue;
const redusHost = conf.redusHost;
const redusPort = conf.redusPort;

module.exports = () => {
  return {
    dbConnectionString,
    webServer,
    locale,
    errorFile,
    combineFile,
    environment,
    corsConf,
    logQueue,
    redusHost,
    redusPort,
  };
};
