const sanitizeHtml = require("sanitize-html");
const { logger } = require("./logMiddleware");

const BLACKLIST_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const blacklistedIPs = {}; // Object to store blacklisted IPs and their expiration times

function sanitizeMiddleware(req, res, next) {
  const ip = req.ip;

  // Check if the IP is blacklisted
  if (blacklistedIPs[ip] && blacklistedIPs[ip] > Date.now()) {
    logger.warn(`Rejected request from blacklisted IP: ${ip}`);
    return res.sendStatus(403); // Return a 403 Forbidden response
  }

  // Check if request body exists and is not empty
  if (req.body) {
    // Save the original request body
    const originalBody = JSON.stringify(req.body);

    // Sanitize any HTML tags in the request body
    req.body = sanitizeJson(req.body);
    // Check if the request body is different from the original request body
    if (originalBody !== JSON.stringify(req.body)) {
      logger.warn(`Request body sanitized: ${JSON.stringify(originalBody)}`);
      // If the request body is different, then blacklist the IP and send a 400 status code
      blacklistedIPs[ip] = Date.now() + BLACKLIST_DURATION;
      logger.warn(`Blacklisted IP: ${ip} for ${BLACKLIST_DURATION} ms`);
      return res
        .status(400)
        .json({ message: "Invalid request body: " + req.originalBody });
    }
  }
  // Check the query string for any HTML tags
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = {};
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        const sanitizedKey = sanitizeHtml(key);
        const sanitizedValue = sanitizeHtml(req.query[key]);
        if(sanitizedKey !== key || sanitizedValue !== req.query[key]) {
          blacklistedIPs[ip] = Date.now() + BLACKLIST_DURATION;
          logger.warn(`Query string sanitized: ${JSON.stringify(req.query)}`);
          return res.status(400).json({ message: "Invalid query string" });
        }
        sanitizedQuery[sanitizedKey] = sanitizedValue;
      }
    }
    req.query = sanitizedQuery;
  }
  next();
}

function sanitizeJson(obj) {
  if (typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = sanitizeJson(obj[key]);
      }
    }
  } else if (typeof obj === "string") {
    obj = sanitizeHtml(obj);
  }
  return obj;
}

module.exports = sanitizeMiddleware;
