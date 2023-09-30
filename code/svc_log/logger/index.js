const winston = require("winston");
const { messageBinder } = require("../locale/locale-binder"); // Import the messageBinder function

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "svc-log", time: new Date().toISOString() },
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

function logByLevel(newData) {
  const { level } = newData;

  switch (level) {
    case "error":
      logger.error(`${messageBinder().ProcessingQueueItem}: ${newData}`);
      break;
    /*case 'info':
      logger.info(`${messageBinder().LogSuccessfullyProcessed}`, newData)
      break
    case 'warn':
      logger.warn(`${messageBinder().ProcessingQueueItem}: ${newData}`)
      break
    case 'http':
      logger.http(`${messageBinder().ProcessingQueueItem}: ${newData}`)
      break
    case 'verbose':
      logger.verbose(`${messageBinder().ProcessingQueueItem}: ${newData}`)
      break
    case 'debug':
      logger.debug(`${messageBinder().ProcessingQueueItem}: ${newData}`)
      break
    case 'silly':
      logger.silly(`${messageBinder().ProcessingQueueItem}: ${newData}`)
      break*/
    default:
      // Invalid or unrecognized level value
      logger.warn(
        `Log level logged into combined file as info, level received: ${level}`
      );
      logger.info(`${messageBinder().LogSuccessfullyProcessed}`, newData);
  }
}

module.exports = {
  logger,
  logByLevel,
};
