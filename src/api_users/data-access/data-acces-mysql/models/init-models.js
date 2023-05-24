var DataTypes = require("sequelize").DataTypes;
var _Admins = require("./Admin");

function initModels(sequelize) {
  var Admins = _Admins(sequelize, DataTypes);

  return {
    Admins,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
