const { HttpErrorCodes } = require("../exceptions/exceptions");
const { evalException } = require("../exceptions/exceptions");
const axios = require("axios");
const { sendToLog } = require("../services/logMiddleware");
const { messageBinder } = require("../services/admin/locale/locale-binder");
const { webServer, svcAuthURL } = require("../../svc_admin/conf/config")();

var adminLogic;

const startAdminRoutes = async function startAdminRoutes(router, logic) {
  adminLogic = logic;

  router.post(
    webServer.routes.providers.createProvider,
    async function (req, res) {
      try {
        sendToLog(
          messageBinder().levelInfo,
          messageBinder().messageLogPostRequest,
          messageBinder().serviceName,
          req
        );
        let aProvider = req.body;
        let newProvider = await adminLogic.createProvider(aProvider);
        // create user in auth service
        const response = await axios({
          method: "post",
          url: `${svcAuthURL}/users`,
          data: {
            email: newProvider.email,
            role_id: 3,
            auth_method: "fed_ed",
          },
        });
        sendToLog(
          messageBinder().levelInfo,
          messageBinder().messageLogPostResponse,
          messageBinder().serviceName,
          response
        );
        return res.status(HttpErrorCodes.HTTP_200_OK).send(newProvider);
      } catch (err) {
        sendToLog(
          messageBinder().levelInfo,
          messageBinder().errorPostRequest,
          messageBinder().serviceName,
          err
        );
        return evalException(err, res);
      }
    }
  );
};

module.exports = {
  startAdminRoutes,
};
