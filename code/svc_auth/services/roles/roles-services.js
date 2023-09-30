var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const preload_roles = async function () {
  const preloadRoles = require("./preload-roles.json");

  for (let i = 0; i < preloadRoles.roles.length; i++) {
    const element = preloadRoles.roles[i];

    let roleFound = await dbModels.Role.findOne({
      where: { name: element.name },
    });
    if (roleFound) {
      return;
    }
    await dbModels.Role.create(element);
  }
};

module.exports = {
  preload_roles,
  setDbModels,
};
