const axios = require('axios');

const auth_routes = require('./routes/svc-auth.json');
const admin_routes = require('./routes/svc-admin.json');
const events_routes = require('./routes/svc-events.json');
const audit_routes = require('./routes/svc-log.json');
const bitacora_routes = require('./routes/svc-bitacora.json');

let routes = [...auth_routes.routes, ...admin_routes.routes, ...events_routes.routes, ...audit_routes.routes, ...bitacora_routes.routes];

module.exports = (app, config) => {
  app.get('/health', (req, res) => {
    res.status(200).send('API Gateway is healthy');
  });

  routes.forEach((route) => {
    app[route.verb](route.upstream, async (req, res) => {
      try {
        if (route.authNeeded) {
          const token = req.headers.authorization;
          const permissions = route.permissionsNeeded;

          if (!token) {
            return res.status(403).send('Forbidden');
          }

          const userCan = await axios({
            method: 'post',
            url: `${config.authUrl}`,
            data: {
              token: token,
            },
          });

          let can = false;
          permissions.forEach((element) => {
            if (userCan.data.role === element) {
              can = true;
            }
          });

          if (!can) {
            return res.status(403).send('Forbidden');
          }
        }


        req.headers.host = route.serviceUrl;
        delete req.headers.connection;
        delete req.headers['accept-encoding'];
        if (req.body) {
          req.headers['content-length'] = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
        }

        const response = await axios({
          method: route.verb,
          url: `${route.serviceUrl}${req.originalUrl}`,
          data: req.body,
          headers: req.headers,
        });

        return res.status(response.status).send(response.data);

      } catch (error) {
        console.error(`Error in API Gateway: ${error.message}`);
        if (error.response) {
          if (error.response.data === "El token ha expirado") {
            return res.status(403).send('El token ha expirado');
          } else {
            return res.status(error.response.status).send(error.response.data);
          }
        } else {
          return res.status(500).send('Internal Server Error');
        }
      }
    });
  });
};
