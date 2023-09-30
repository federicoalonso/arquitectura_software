var express = require("express");
const http = require("http");
const cors = require("cors");
const { webServer, environment, corsConf } = require("../conf/config")();
const { sendToLog } = require("../services/logMiddleware");
const { messageBinder } = require("../services/admin/locale/locale-binder");

var app = express();
const server = http.createServer(app);
const baseUrl = webServer.baseUrl;
const api_port = webServer.port || "4010";
/* require controllers  */
//const { startHealthCheckRoutes } = require('./health-check/health-check-api')
const { startAdminRoutes } = require("./admin-controller");

const doCommonFilter = (app) => {
  /*start filtros del middleware*/
  app.use(express.static("public"));
  app.use(express.json());
  //app.use(loggerMiddleware)
  const corsOptions = corsConf[environment].corsOptions;
  app.use(cors(corsOptions));
};

const initializeRoutes = async function (services) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().messageInitializingRoutes,
    messageBinder().serviceName,
    services
  );
  doCommonFilter(app); /*expres filtes for all request*/
  let router = express.Router();
  //await startHealthCheckRoutes(router, services.dbService)
  await startAdminRoutes(router, services.adminService);
  //sendToLog('Info', 'Initialized Routes', services)
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().messageInitializedRoutes,
    messageBinder().serviceName,
    services
  );
  app.use(baseUrl, router);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().applicationInitialized,
    messageBinder().serviceName,
    messageBinder().serviceName,
    api_port
  );
  server.listen(api_port, () => {
    console.log(
      `[service: routeHandler] [function: initializeRoutesServer] [type:I] is running on port ${api_port}`
    );
  });
};

module.exports = {
  initializeRoutes,
};
