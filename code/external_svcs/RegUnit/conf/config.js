const conf = require('./config.json')
const webServer = conf.webServer
const errorFile = conf.errorFile
const combineFile = conf.combineFile
const environment = conf.environment
const corsConf = conf.cors

module.exports = () => {
  return {
    webServer,
    errorFile,
    combineFile,
    environment,
    corsConf
  }
}
