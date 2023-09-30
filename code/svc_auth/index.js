const { initializeRoutes } = require("./controllers/routeHandler");
const { initializeModels } = require("./data-access/initialize");
const { sendToLog } = require("./services/logMiddleware");
const { messageBinder } = require("./services/users/locale/locale-binder");
const dbService = require("./services/db/db-services");
const usersService = require("./services/users/users-services");
const rolesService = require("./services/roles/roles-services");

const main = async function () {
  /* mysql services */
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().initializingModels,
    messageBinder().serviceName,
    {}
  );
  let mySQLdbModels = await initializeModels();

  let mySqlServices = [usersService, rolesService, dbService];

  await setModelsToServices(mySqlServices, mySQLdbModels);

  let serviceService = {
    usersService: usersService,
    rolesService: rolesService,
    dbService: dbService,
  };

  await serviceService.rolesService.preload_roles();
  await serviceService.usersService.preload_users();

  await initializeRoutes(serviceService);

  sendToLog(
    messageBinder().levelInfo,
    messageBinder().setModelsToServices,
    messageBinder().serviceName,
    mySqlServices
  );
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().initializedRoutes,
    messageBinder().serviceName,
    {}
  );
};

main();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
