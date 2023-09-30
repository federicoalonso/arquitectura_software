const { initializeRoutes } = require('./controllers/routesHandler')
const countryCityCoinService = require('./services/CountryCityCoin/countryCityCoin-services')

const main = async function () {
  let serviceService = {
    countryCityCoinService: countryCityCoinService
  }
  await initializeRoutes(serviceService)
}

main()
