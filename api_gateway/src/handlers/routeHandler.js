const axios = require("axios");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const ad_routes = require("./routes/api-ad.json");
const auth_routes = require("./routes/api-auth.json");

let routes = [...ad_routes.routes, ...auth_routes.routes]

module.exports = (app, config) => {
  app.get("/health", (req, res) => {
    res.status(200).send("API Gateway is healthy");
  });

  routes.forEach((route) => {
    app[route.verb](route.upstream, async (req, res) => {
      try {
        if (route.authNeeded) {
          const token = req.headers.authorization;
          const permission = route.permissionNeeded;
          const verb = route.verb;

          const userCan = await axios({
            method: "post",
            url: `${config.authUrl}`,
            data: {
              Token: token,
              Permission: permission,
              Verb: verb,
            },
            httpsAgent: agent,
          });
          if (!userCan.data) {
            return res.status(403).send("Forbidden");
          }
        }

        const response = await axios({
          method: route.verb,
          url: `${route.serviceUrl}${req.originalUrl}`,
          data: req.body,
          httpsAgent: agent,
        });

        return res.status(response.status).send(response.data);
      } catch (error) {
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(500).send("Internal Server Error");
        }
      }
    });
  });
};
