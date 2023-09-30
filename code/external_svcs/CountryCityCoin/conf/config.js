const conf = require('./config.json')
const webServer = conf.webServer
const locale = conf.locale
const errorFile = conf.errorFile
const combineFile = conf.combineFile
const environment = conf.environment
const corsConf = conf.cors

module.exports = () => {
  return {
    webServer,
    locale,
    errorFile,
    combineFile,
    environment,
    corsConf
  }
}
