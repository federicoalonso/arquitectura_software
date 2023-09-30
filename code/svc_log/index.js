const queueProcessor = require("./queueProcessor");
const expressApp = require("./expressApp");
const initializeMongoDB = require("./data-access/initialize").initializeMongoDB;

expressApp.start();
queueProcessor.start();

const main = async function () {
  // Initialize the database connection
  /* mongo services  */
  await initializeMongoDB();
};

main();
