const { queue } = require("../queues/queue-binder");
const { logger, logByLevel } = require("../logger/index");
const Data = require("../data-access/dataSchema");
const { messageBinder } = require("../locale/locale-binder");
const { saveToDatabase } = require("../data-access-middleware/middlewareDB");
const processQueue = queue("bitacoraQueue");

async function process(job, done) {
  try {
    let jsonData = job.data;
    const newData = new Data(jsonData);
    logByLevel(newData);
    await saveToDatabase(newData);
    setTimeout(done, 0);
  } catch (error) {
    logger.error(`${messageBinder().LogProcessFail} ${error}`);
    done(error);
  }
}

module.exports = {
  start: () => {
    logger.info("Starting log service");
    processQueue.process(process);
  },
  stop: () => {
    logger.info("Stopping log service");
    processQueue.close();
  },
};
