const express = require("express");
const { HttpErrorCodes } = require("../exceptions/exceptions");
const { logger, logByLevel } = require("../logger/index");

const { queue } = require("../queues/queue-binder");
const { webServer, logQueue } = require("../config/config")();
const { evalException } = require("../exceptions/exceptions");
const processQueue = queue(logQueue || "logQueue");
const {
  retrieveByURL,
  retrieveEmailDataByEvent,
  retrieveAuthLevelDataByTime,
} = require("../data-access-middleware/middlewareDB");

const app = express();
app.use(express.json());
app.get("/log/health-check", (req, res) => {
  res.send("OK");
});

app.post(webServer.routes.log.logQueue, async function (req, res) {
  try {
    const data = req.body;
    logger.info(`Received request to queue log: ${data}`);
    logByLevel(data);
    let dataQueued = await processQueue.add(data, { removeOnComplete: true });
    return res.status(HttpErrorCodes.HTTP_200_OK).send(dataQueued);
  } catch (err) {
    return evalException(err, res);
  }
});

app.post(webServer.routes.log.getURLStatistics, async function (req, res) {
  try {
    // get a list of url from the body
    const urls = req.body.urls;
    logger.info(`Received request to get statistics for urls: ${urls}`);
    // get the statistics for each url
    let statistics = [];
    for (let url of urls) {
      if (url) {
        let data = await retrieveByURL(url);
        statistics.push({
          url: url,
          tiempo_promedio: data.tiempo_promedio,
          concurrencia_maxima: data.concurrencia_maxima,
        });
      }
    }
    return res.status(HttpErrorCodes.HTTP_200_OK).send(statistics);
  } catch (err) {
    console.log(err);
    return evalException(err, res);
  }
});

app.post(webServer.routes.log.getEmailStatistics, async function (req, res) {
  try {
    // get a list of id from the body
    const ids = req.body.ids;
    logger.info(`Received request to get statistics for ids: ${ids}`);
    // get the statistics for each id
    let statistics = [];
    for (let id of ids) {
      let data = await retrieveEmailDataByEvent(id);
      if (!data) {
        return res
          .status(HttpErrorCodes.HTTP_404_NOT_FOUND)
          .send({ error: `No se encontró el id ${id}` });
      }
      statistics.push({
        id: id,
        fallidos: data.error ? data.error : 0,
        correctos: data.info ? data.info : 0,
      });
    }
    return res.status(HttpErrorCodes.HTTP_200_OK).send(statistics);
  } catch (err) {
    console.log(err);
    return evalException(err, res);
  }
});

app.get(webServer.routes.log.getAuditLogs, async function (req, res) {
  try {
    const { from, to } = req.query;
    logger.info(`Received request to get audit logs from ${from} to ${to}`);
    let data = await retrieveAuthLevelDataByTime(from, to);
    return res.status(HttpErrorCodes.HTTP_200_OK).send(data);
  } catch (err) {
    console.log(err);
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
