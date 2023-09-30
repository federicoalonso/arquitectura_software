const conf = require("./config.json");
const dbConnectionString = conf.dbConnectionString;
const webServer = conf.webServer;
const locale = conf.locale;
const errorFile = conf.errorFile;
const combineFile = conf.combineFile;
const environment = conf.environment;
const corsConf = conf.cors;
const svcAuthURL = conf.svcAuthURL;
const logQueue = conf.logQueue;

module.exports = () => {
  return {
    dbConnectionString,
    webServer,
    locale,
    errorFile,
    combineFile,
    environment,
    corsConf,
    svcAuthURL,
    logQueue,
  };
};
