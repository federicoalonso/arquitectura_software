const { initModels } = require("./models/init-models");
const { dbConnectionString } = require("../../conf/config")();
const Sequelize = require("sequelize");

const initializeModels = async function () {
  console.log(
    `[initialize: api] [function: initializeModels] [type:I] system init mysql models`
  );

  try {
    //open connection
    const sequelize = new Sequelize(dbConnectionString);

    //initialize models
    let models = initModels(sequelize);
    models.sequelize = sequelize;

    //sinchronize models and tables
    await models.Provider.sync();
    await models.Event.sync();
    await models.Client.sync();
    await models.ClientEvent.sync();

    return models;
  } catch (e) {
    console.log(
      `[initialize: api] [function: initializeModels] [type:E] ${e} Error connecting database, system will stop.`
    );
    process.exit(1);
  }
};
module.exports = {
  initializeModels,
};
