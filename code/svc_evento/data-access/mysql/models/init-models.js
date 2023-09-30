var DataTypes = require("sequelize").DataTypes;
var _Provider = require("./Providers");
var _Events = require("./Events");
var _ClientEvent = require("./ClientEvent");
var _Client = require("./Client");

function initModels(sequelize) {
  var Provider = _Provider(sequelize, DataTypes);
  var Event = _Events(sequelize, DataTypes);
  var Client = _Client(sequelize, DataTypes);
  var ClientEvent = _ClientEvent(sequelize, DataTypes);

  return {
    Provider,
    Event,
    Client,
    ClientEvent,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
