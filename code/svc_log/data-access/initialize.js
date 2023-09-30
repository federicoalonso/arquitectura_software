require("dotenv").config();
const mongoose = require("mongoose");
const { dbConnectionString } = require("../config/config")();
const dataSchema = require("./dataSchema");

const initializeMongoDB = async function () {
  console.log(dbConnectionString);
  try {
    let connectionString = dbConnectionString || "";
    mongoose.connect(connectionString);
    console.log(
      `[initialize: mongoDB] [function: initializeMongo] [type:I] system init mongodb models`
    );
  } catch (err) {
    console.log(
      `[initialize: mongoDB] [function: initializeMongo][type:E] system init monggodb models`
    );
  }
  return dataSchema;
};

module.exports = {
  initializeMongoDB,
};
