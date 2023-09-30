var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");
var _Roles = require("./Roles");

function initModels(sequelize) {
  var User = _Users(sequelize, DataTypes);
  var Role = _Roles(sequelize, DataTypes);

  return {
    User,
    Role,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
