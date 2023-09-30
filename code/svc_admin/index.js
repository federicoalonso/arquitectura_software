const { initializeRoutes } = require("./controllers/routesHandler");
const { initializeModels } = require("./data-access/mysql/models/initialize");
const dbService = require("./services/db/db-services");
const adminService = require("./services/admin/admin-services");

const main = async function () {
  let mySQLdbModels = await initializeModels();
  let mySqlServices = [adminService, dbService];
  await setModelsToServices(mySqlServices, mySQLdbModels);
  let serviceService = {
    adminService: adminService,
    dbService: dbService,
  };
  await initializeRoutes(serviceService);
};

main();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
