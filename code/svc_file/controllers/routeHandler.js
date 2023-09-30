var express = require("express");
const http = require("http");
const cors = require("cors");
const { webServer, environment, corsConf } = require("../conf/config")();
const { loggerMiddleware } = require("../middleware/logMiddleware");

var app = express();

const server = http.createServer(app);

const baseUrl = webServer.baseUrl;
const api_port = webServer.port || "4002";

/* require controllers  */
const { startEventsRoutes } = require("./events/eventController");

const doCommonFilter = (app) => {
  /*start filtros del middleware*/
  app.use(express.static("public"));
  app.use(express.json());

  const corsOptions = corsConf[environment].corsOptions;
  app.use(cors(corsOptions));
  app.use(loggerMiddleware);
};

const initializeRoutes = async function (services) {
  doCommonFilter(app); /*expres filtes for all request*/

  let router = express.Router();
  await startEventsRoutes(router, services.eventsService);

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
