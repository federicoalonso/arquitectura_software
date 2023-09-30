var DataTypes = require("sequelize").DataTypes;
var _Providers = require("./Providers");

function initModels(sequelize) {
  var Providers = _Providers(sequelize, DataTypes);
  return {
    Providers,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
