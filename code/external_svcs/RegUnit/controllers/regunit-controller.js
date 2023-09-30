const { HttpErrorCodes } = require('../exceptions/exceptions')
const { evalException } = require('../exceptions/exceptions')
const { webServer } = require('../../RegUnit/conf/config')()

var regUnitLogic

const startRegUnitRoutes = async function startRegUnitRoutes(router, logic) {
  regUnitLogic = logic

  router.get(
    webServer.routes.authorization.authorizedProvider,
    async function (req, res) {
      try {
        let data = req.query;
        let authorizedProvider = await regUnitLogic.isAuthorizedProvider(
          data.email
        )
        return res.status(HttpErrorCodes.HTTP_200_OK).send(authorizedProvider)
      } catch (err) {
        return evalException(err, res)
      }
    }
  )
}

module.exports = {
  startRegUnitRoutes
}
