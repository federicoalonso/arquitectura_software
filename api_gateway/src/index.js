const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const config = require("./config.json");
const routeHandler = require("./handlers/routeHandler");
const { loggerMiddleware } = require("./middleware/logMiddleware");
const sanitizeMiddleware = require("./middleware/sanitizeMiddleware");
const handleUndefinedRoutes = require("./handlers/undefinedHandler");

const app = express();

// Set environment
const env = config.environment || "development";

// Add security headers with helmet
app.use(helmet());

// Enable CORS
const corsOptions = config.cors[env].corsOptions;

app.use(cors(corsOptions));

app.use(bodyParser.json());

// Add logging middleware
app.use(loggerMiddleware);

// Add sanitize middleware
app.use(sanitizeMiddleware);

// Add rate limiting
const limiter = rateLimit({
  windowMs: config.limiter.duration,
  max: config.limiter.max,
  message: config.limiter.message,
});

app.use(limiter);

// Add session support with express-session middleware
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

routeHandler(app, config);

app.use(handleUndefinedRoutes);

app.listen(config.port, () => {
  console.log("Listening on port " + config.port + "...");
});
