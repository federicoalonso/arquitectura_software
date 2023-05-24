const { initializeRoutes } = require("./controllers/middleware");
const { initializeModels } = require("./data-access/data-acces-mysql/initialize");

const familiesService = require("./services/families/families-services");
const categoriesService = require("./services/categories/categories-services");
const dbService = require("./services/db/db-services");

const main = async function () {
  /* mysql services */
  let mySQLdbModels = await initializeModels();
  let mySqlServices = [familiesService, categoriesService, dbService];
  await setModelsToServices(mySqlServices, mySQLdbModels);

  let serviceService = {
    adminService: adminService,
  };

  await initializeRoutes(serviceService);
};

main();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
