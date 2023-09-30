var DataTypes = require("sequelize").DataTypes;
var _Provider = require("./Providers");
var _Events = require("./Events");

function initModels(sequelize) {
  var Provider = _Provider(sequelize, DataTypes);
  var Event = _Events(sequelize, DataTypes);

  return {
    Provider,
    Event,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
