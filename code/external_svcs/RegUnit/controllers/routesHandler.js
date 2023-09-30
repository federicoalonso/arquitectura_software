var express = require('express')
const http = require('http')
const cors = require('cors')
const { webServer, environment, corsConf } = require('../conf/config')()

var app = express()

const server = http.createServer(app)

const baseUrl = webServer.baseUrl
const api_port = webServer.port || '5011'

const { startRegUnitRoutes } = require('./regunit-controller')

const doCommonFilter = (app) => {
  app.use(express.static('public'))
  app.use(express.json())

  const corsOptions = corsConf[environment].corsOptions
  app.use(cors(corsOptions))
}

const initializeRoutes = async function (services) {
  doCommonFilter(app)

  let router = express.Router()
  await startRegUnitRoutes(router, services.regunitService)

  app.use(baseUrl, router)
  server.listen(api_port, () => {
    console.log(
      `[service: Rulatory Unit] [function: RegUnitAutorization] [type:I] is running on port ${api_port}`
    )
  })
}

module.exports = {
  initializeRoutes
}
