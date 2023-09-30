const { initializeRoutes } = require('./controllers/routesHandler')
const regunitService = require('./services/RegUnit/regunit-services')

const main = async function () {
  let serviceService = {
    regunitService: regunitService
  }
  await initializeRoutes(serviceService)
}

main()
