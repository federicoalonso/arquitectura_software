const { initializeModels } = require("../data-access/initialize");
const { initializeRoutes } = require("../controllers/eventController");
const { sendToLog } = require("./services/logMiddleware");
const { messageBinder } = require("./services/events/locale/locale-binder");

const proveedorService = require("./proveedor/proveedor-services");
const eventService = require("./events/events-services");

const main = async function () {
  /* mysql services */
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().initializingMySQLModels,
    messageBinder().serviceName,
    {}
  );

  let mySQLdbModels = await initializeModels();
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().mySQLModelsInitialized,
    messageBinder().serviceName,
    mySQLdbModels
  );
  let mySqlServices = [eventService, proveedorService];
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().mySQLServices,
    messageBinder().serviceName,
    mySqlServices
  );
  await setModelsToServices(mySqlServices, mySQLdbModels);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().setModelsToServices,
    messageBinder().serviceName,
    {}
  );
  let serviceService = {
    eventService: eventService,
    proveedorService: proveedorService,
  };

  sendToLog(
    messageBinder().levelInfo,
    messageBinder().initializingRoutes,
    messageBinder().serviceName,
    serviceService
  );
  initializeRoutes(serviceService);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().routesInitialized,
    messageBinder().serviceName,
    serviceService
  );
};

main();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
