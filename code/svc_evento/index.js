const { initializeRoutes } = require("./controllers/routeHandler");
const { initializeModels } = require("./data-access/mysql/initialize");
const { initializeMongoDB } = require("./data-access/mongo/connect-mongodb");
const { sendToLog } = require("./services/logMiddleware");
const { messageBinder } = require("./services/events/locale/locale-binder");

const eventsService = require("./services/events/events-services");
const providerService = require("./services/provider/provider-services");

const init = async function () {
  console.log(`[initialize: api] [function: init] [type:I] system init`);

  try {
    //initialize models
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().initializeModels,
      messageBinder().serviceName,
      {}
    );
    let mySQLdbModels = await initializeModels();
    let mySqlServices = [providerService, eventsService];
    await setModelsToServices(mySqlServices, mySQLdbModels);
    await initializeMongoDB();

    let serviceService = {
      providerService: providerService,
      eventsService: eventsService,
    };
    await initializeRoutes(serviceService);
  } catch (e) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileInitializing,
      messageBinder().serviceName,
      e
    );
    console.log(
      `[initialize: api] [function: init] [type:E] ${e} Error connecting database, system will stop.`
    );
    process.exit(1);
  }
};

init();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
