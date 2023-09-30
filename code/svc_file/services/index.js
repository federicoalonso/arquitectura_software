const { initializeModels } = require("../data-access/initialize");
const { initializeRoutes } = require("../controllers/eventController");

const eventService = require("./events/events-services");

const main = async function () {
  /* mysql services */
  let mySQLdbModels = await initializeModels();
  let mySqlServices = [eventService];
  await setModelsToServices(mySqlServices, mySQLdbModels);

  let serviceService = {
    eventService: eventService,
  };

  initializeRoutes(serviceService);
};

main();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
