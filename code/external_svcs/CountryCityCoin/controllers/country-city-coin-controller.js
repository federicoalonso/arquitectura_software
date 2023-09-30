const { HttpErrorCodes } = require('../exceptions/exceptions')
const { evalException } = require('../exceptions/exceptions')
/* get config */
const { webServer } = require('../../CountryCityCoin/conf/config')()

var countryCityCoinLogic

const startCountryCityCoinRoutes = async function startCountryCityCoinRoutes(
  router,
  logic
) {
  countryCityCoinLogic = logic

  router.get(
    webServer.routes.countryCityCoin.countryCityCoin,
    async function (req, res) {
      try {
        let aCountry = req.body
        let countryCityCoin =
          await countryCityCoinLogic.getCityAndCurrencyDetailsByCountry(
            aCountry
          )
        return res.status(HttpErrorCodes.HTTP_200_OK).send(countryCityCoin)
      } catch (err) {
        return evalException(err, res)
      }
    }
  )
}

module.exports = {
  startCountryCityCoinRoutes
}
