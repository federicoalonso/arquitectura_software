const mongoose = require("mongoose");
const Auths = require("./models/events-autorization-model");
const { mongoConnectionString } = require("../../conf/config")();

const initializeMongoDB = async function () {
  try {
    mongoose.connect(mongoConnectionString);
    console.log(
      `[initialize: api] [function: initializeModels] [type:I] system init mongodb models}`
    );
  } catch (err) {
    console.log(
      `[initialize: api] [function: initializeModels] [type:E] system init monggodb models}`
    );
    console.error(err);
  }
  return Auths;
};

module.exports = {
  initializeMongoDB,
};
