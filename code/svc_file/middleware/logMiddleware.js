const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const { combineFile, errorFile, logQueue } = require("../conf/config")();
const { queue } = require("../queues/queue-binder");
const processQueue = queue(logQueue || "emailQueue");

// Define custom log format
const customLogFormat = printf(
  ({ level, message, timestamp, duration, src, url, client }) => {
    return JSON.stringify({
      level,
      message,
      timestamp,
      duration,
      src,
      url,
      client,
    });
  }
);

// Create logger instance
const logger = createLogger({
  level: "info",
  format: combine(timestamp(), customLogFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: errorFile, level: "error" }),
    new transports.File({ filename: combineFile }),
  ],
});

function loggerMiddleware(req, res, next) {
  const start = Date.now();
  const src = `${req.ip}`;
  const client = req.headers["user-agent"];
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
    const message = `${statusCode} - ${req.method} ${url} - ${duration} ms`;
    logger.info({ message, duration, src, url, client });

    let level = "";
    if (statusCode === 401) {
      level = "auth";
    } else if (statusCode === 403) {
      level = "auth";
    } else if (statusCode >= 404) {
      level = "error";
    } else {
      level = "statistics";
    }
    processQueue.add(
      {
        level: level,
        message: message,
        service: "svc_file",
        url: url,
        duration: duration,
        timestamp: Date.now(),
        logBody: {
          src: src,
          client: client,
          statusCode: statusCode,
        },
      },
      { removeOnComplete: true }
    );
  });
  next();
}

module.exports = { loggerMiddleware, logger };
