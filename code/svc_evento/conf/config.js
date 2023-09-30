const conf = require("./config.json");

const dbConnectionString = conf.dbConnectionString;
const webServer = conf.webServer;
const locale = conf.locale;
const errorFile = conf.errorFile;
const combineFile = conf.combineFile;
const environment = conf.environment;
const corsConf = conf.cors;
const domain = conf.domain;
const mongoConnectionString = conf.mongoConnectionString;
const pipeline = conf.pipeline;
const regulatoryUnitURL = conf.regulatoryUnitURL;
const customPaymentURL = conf.customPaymentURL;
const emailQueue = conf.emailQueue;
const emailAddress = conf.emailAddress;
const svcAuthURL = conf.svcAuthURL;
const bitacoraQueue = conf.bitacoraQueue;
const svcLogURL = conf.svcLogURL;
const svcBitacoraURL = conf.svcBitacoraURL;
const horasAlertaEventoNoAutorizado = conf.horasAlertaEventoNoAutorizado;

module.exports = () => {
  return {
    dbConnectionString,
    webServer,
    locale,
    errorFile,
    combineFile,
    environment,
    corsConf,
    domain,
    mongoConnectionString,
    pipeline,
    regulatoryUnitURL,
    customPaymentURL,
    emailQueue,
    emailAddress,
    svcAuthURL,
    horasAlertaEventoNoAutorizado,
    bitacoraQueue,
    svcLogURL,
    svcBitacoraURL,
  };
};
