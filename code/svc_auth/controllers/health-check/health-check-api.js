const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { webServer } = require("../../conf/config")();
const { sendToLog } = require("../../services/logMiddleware");
const { messageBinder } = require("../../services/users/locale/locale-binder");

const startHealthCheckRoutes = async function startHealthCheckRoutes(
  router,
  logic
) {
  var logicHealt = logic;
  router.get(webServer.routes.healthCheck, async function (req, res) {
    try {
      /***** logic to check health *****/
      let data = await logicHealt.check();
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().logicHealthOk,
        messageBinder().serviceName,
        data
      );
      return res.status(HttpErrorCodes.HTTP_200_OK).send(data);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().logicHealthError,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });
};

module.exports = {
  startHealthCheckRoutes,
};
