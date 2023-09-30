var express = require('express')
const http = require('http')
const cors = require('cors')
const { webServer, environment, corsConf } = require('../conf/config')()

var app = express()

const server = http.createServer(app)

const baseUrl = webServer.baseUrl
const api_port = webServer.port || '6011'

/* require controllers  */
const { startCountryCityCoinRoutes } = require('./country-city-coin-controller')

const doCommonFilter = (app) => {
  /*start filtros del middleware*/
  app.use(express.static('public'))
  app.use(express.json())
  //app.use(loggerMiddleware)

  const corsOptions = corsConf[environment].corsOptions
  app.use(cors(corsOptions))
}

const initializeRoutes = async function (services) {
  doCommonFilter(app) /*expres filtes for all request*/

  let router = express.Router()

  console.log('Service: ', services)

  await startCountryCityCoinRoutes(router, services.countryCityCoinService)
  console.log('countryCityCoinService: ', services.countryCityCoinService)

  app.use(baseUrl, router)
  server.listen(api_port, () => {
    console.log(
      `[service: Country-City-Coin service] [function: CountryCitycoin] [type:I] is running on port ${api_port}`
    )
  })
}

module.exports = {
  initializeRoutes
}
