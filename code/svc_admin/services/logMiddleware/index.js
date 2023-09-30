const { logQueue } = require("../../conf/config")();
const { queue } = require("../../queues/queue-binder");
const logProcessQueue = queue(logQueue || "logQueue");

const sendToLog = async (level, message, svcName, data) => {
  try {
    const logItem = {
      level: level,
      message: message,
      service: svcName,
      timestamp: Date.now(),
      logBody: data,
    };
    await logProcessQueue.add(logItem, { removeOnComplete: true });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  sendToLog,
};
