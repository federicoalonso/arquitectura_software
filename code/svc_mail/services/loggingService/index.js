const { logQueue } = require("../../config/config")();
const { queue } = require("../../queues/queue-binder");
const logProcessQueue = queue(logQueue || "logQueue");

const sendTolog = async (data) => {
  try {
    await logProcessQueue.add(data, { removeOnComplete: true });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  sendTolog,
};
