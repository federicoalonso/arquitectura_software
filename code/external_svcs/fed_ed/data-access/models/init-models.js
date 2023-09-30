var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");

function initModels(sequelize) {
  var User = _Users(sequelize, DataTypes);

  return {
    User,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
