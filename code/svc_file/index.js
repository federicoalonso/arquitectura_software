const { initializeRoutes } = require("./controllers/routeHandler");
const { initializeModels } = require("./data-access/initialize");

const eventsService = require("./services/events/events-services");

const init = async function () {
  console.log(`[initialize: api] [function: init] [type:I] system init`);

  try {
    //initialize models
    let mySQLdbModels = await initializeModels();
    let mySqlServices = [eventsService];
    await setModelsToServices(mySqlServices, mySQLdbModels);

    let serviceService = {
      eventsService: eventsService,
    };

    await initializeRoutes(serviceService);
  } catch (e) {
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
