const express = require("express");
const { HttpErrorCodes } = require("../exceptions/exceptions");
const { logger, logByLevel } = require("../logger/index");
const { queue } = require("../queues/queue-binder");
const { webServer } = require("../config/config")();
const { evalException } = require("../exceptions/exceptions");
const processQueue = queue("bitacoraQueue");
const { retrieveData } = require("../data-access-middleware/middlewareDB");

const app = express();
app.use(express.json());
app.get("/log/health-check", (req, res) => {
  res.send("OK");
});

app.post(webServer.routes.svcBitacora.bitacora, async function (req, res) {
  try {
    const data = req.body;
    logger.info(`Received request to queue event on bitacora: ${data}`);
    logByLevel(data);
    let dataQueued = await processQueue.add(data, { removeOnComplete: true });
    return res.status(HttpErrorCodes.HTTP_200_OK).send(dataQueued);
  } catch (err) {
    return evalException(err, res);
  }
});

app.get(webServer.routes.svcBitacora.bitacora, async function (req, res) {
  try {
    const { from, until } = req.query;
    // Retrieve data from MongoDB using the middleware
    const data = await retrieveData(from, until);
    // Return the retrieved data
    return res.status(HttpErrorCodes.HTTP_200_OK).json(data);
  } catch (err) {
    return evalException(err, res);
  }
});

module.exports = {
  start: () => {
    logger.info("Starting express app");
    app.listen(webServer.port, () => {
      logger.info(`Server running on port ${webServer.port}`);
    });
  },
  stop: () => {
    logger.info("Stopping express app");
    app.close();
  },
};
