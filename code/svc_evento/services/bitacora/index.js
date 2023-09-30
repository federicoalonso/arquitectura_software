const { bitacoraQueue } = require("../../conf/config")();
const { queue } = require("../../queues/queue-binder");
const bitacoraProcessQueue = queue(bitacoraQueue || "bitacoraQueue");

const sendToBitacora = async (data) => {
  try {
    await bitacoraProcessQueue.add(data, { removeOnComplete: true });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  sendToBitacora,
};
