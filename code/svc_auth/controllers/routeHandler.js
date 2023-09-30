var express = require("express");
const http = require("http");
const cors = require("cors");
const { webServer, environment, corsConf } = require("../conf/config")();
const { loggerMiddleware } = require("../middleware/logMiddleware");

var app = express();

const server = http.createServer(app);

const baseUrl = webServer.baseUrl;
const api_port = webServer.port || "4000";

/* require controllers  */
const { startHealthCheckRoutes } = require("./health-check/health-check-api");
const { startUsersRoutes } = require("./users/users-controller");

const doCommonFilter = (app) => {
  /*start filtros del middleware*/
  app.use(express.static("public"));
  app.use(express.json());
  app.use(loggerMiddleware);

  const corsOptions = corsConf[environment].corsOptions;
  app.use(cors(corsOptions));
};

const initializeRoutes = async function (services) {
  doCommonFilter(app); /*expres filtes for all request*/

  let router = express.Router();
  await startHealthCheckRoutes(router, services.dbService);
  await startUsersRoutes(router, services.usersService);

  app.use(baseUrl, router);
  server.listen(api_port, () => {
    console.log(
      `[service: routeHandler] [function: initializeRoutesServer] [tyoe:I] is running on port ${api_port}`
    );
  });
};

module.exports = {
  initializeRoutes,
};
