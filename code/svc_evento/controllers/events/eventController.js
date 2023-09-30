const {
  HttpErrorCodes,
  evalException,
} = require("../../exceptions/exceptions");
const jwt_decode = require("jwt-decode");
const axios = require("axios");
const { svcAuthURL } = require("../../conf/config")();

var eventLogic;

const startEventsRoutes = async function startEventsRoutes(router, logic) {
  eventLogic = logic;

  router.post("/evento", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(HttpErrorCodes.ERROR_401_UNAUTHORIZED)
        .json({ msg: "No token, authorization denied" });
    }

    try {
      const decodedToken = jwt_decode(token);

      const { nombre, descripcion, f_inicio, f_fin, categoria } = req.body;
      let f_start = new Date(f_inicio);
      let f_end = new Date(f_fin);

      let newRecord = await eventLogic.create({
        nombre,
        descripcion,
        f_inicio: f_start,
        f_fin: f_end,
        categoria,
        proveedor_email: decodedToken.email,
        tipo_aut: "automatico",
        autorizado: "false",
      });

      res.json({ newRecord });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );

      return evalException(err, res);
    }
  });

  router.put("/evento/:id/auth", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(HttpErrorCodes.ERROR_401_UNAUTHORIZED)
        .json({ msg: "No token, authorization denied" });
    }
    try {
      const decodedToken = jwt_decode(token);
      const { id } = req.params;
      const { event_name, provider_name, auth_type, auth_status } = req.body;
      if (!event_name || !provider_name || !auth_type) {
        return res
          .status(HttpErrorCodes.ERROR_400_BAD_REQUEST)
          .json({ msg: "Faltan datos" });
      }
      let newRecord = await eventLogic.authEvent(id, {
        event_name,
        provider_name,
        auth_type,
        auth_status,
        auth_by: decodedToken.email,
      });

      let eventToUpdate = await eventLogic.getEvent(parseInt(id));

      await eventLogic.update(parseInt(id), {
        nombre: eventToUpdate.nombre,
        descripcion: eventToUpdate.descripcion,
        f_inicio: eventToUpdate.f_inicio,
        f_fin: eventToUpdate.f_fin,
        imagen_min_url: eventToUpdate.imagen_min_url,
        imagen_prin_url: eventToUpdate.imagen_prin_url,
        video_url: eventToUpdate.video_url,
        video_size: eventToUpdate.video_size,
        categoria: eventToUpdate.categoria,
        proveedor_email: eventToUpdate.proveedor_email,
        tipo_aut: auth_type,
        autorizado: auth_status,
        evento_url: auth_status ? newRecord.evento_url : "",
      });

      res.json({ newRecord });

      // res.json({ newRecord });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.put("/evento/:id", async (req, res) => {
    const token = req.headers.authorization;
    const { id } = req.params;

    if (!token) {
      return res
        .status(HttpErrorCodes.ERROR_401_UNAUTHORIZED)
        .json({ msg: "No token, authorization denied" });
    }

    if (!id) {
      return res
        .status(HttpErrorCodes.ERROR_400_BAD_REQUEST)
        .json({ msg: "Id es obligatorio" });
    }

    try {
      const decodedToken = jwt_decode(token);

      const { nombre, descripcion, f_inicio, f_fin, categoria } = req.body;
      let f_start = new Date(f_inicio);
      let f_end = new Date(f_fin);

      let eventToUpdate = await eventLogic.getEvent(parseInt(id));

      if (decodedToken.email !== eventToUpdate.proveedor_email) {
        return res
          .status(HttpErrorCodes.ERROR_401_UNAUTHORIZED)
          .json({ msg: "No tienes permisos para editar este evento" });
      }

      let newRecord = await eventLogic.updateUnautorizedEvent(parseInt(id), {
        nombre: nombre,
        descripcion: descripcion,
        f_inicio: f_start,
        f_fin: f_end,
        imagen_min_url: eventToUpdate.imagen_min_url,
        imagen_prin_url: eventToUpdate.imagen_prin_url,
        video_url: eventToUpdate.video_url,
        video_size: eventToUpdate.video_size,
        categoria: categoria,
        proveedor_email: eventToUpdate.proveedor_email,
        tipo_aut: eventToUpdate.tipo_aut,
        autorizado: eventToUpdate.autorizado,
        evento_url: eventToUpdate.evento_url,
      });

      res.json({ newRecord });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );

      return evalException(err, res);
    }
  });

  router.get("/evento", async (req, res) => {
    try {
      let events = await eventLogic.getAuthorizedEvents();
      res.json({ events });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/evento_admin_bitacora", async (req, res) => {
    try {
      const { from, until } = req.query;
      let events = await eventLogic.getEventInfoForAdminBitacora(from, until);
      res.json({ events });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.post("/cliente", async (req, res) => {
    try {
      const { email } = req.body;
      await axios({
        method: "post",
        url: `${svcAuthURL}/users`,
        data: {
          email: email,
          role_id: 2,
          auth_method: "fed_ed",
        },
      });

      let client = await eventLogic.createClient(email);

      res.json({ client });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.post("/evento/:evento_id/:cliente_id", async (req, res) => {
    try {
      const { evento_id, cliente_id } = req.params;
      await eventLogic.suscribeToEvent(evento_id, cliente_id);

      res.json({ response: "Se ha suscripto correctamente." });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.post("/mensaje", async (req, res) => {
    try {
      const { evento_id, mensaje } = req.body;
      const token = req.headers.authorization;
      // get email
      const decodedToken = jwt_decode(token);
      const { email } = decodedToken;
      await eventLogic.sendMessageToSuscribers(evento_id, mensaje, email);

      res.json({ response: "Se ha enviado el mensaje correctamente." });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.post("/compra/:evento_id/:user_id", async (req, res) => {
    try {
      const { nombre_completo, f_nacimiento, pais, evento_id, payment_method } =
        req.body;
      const token = req.headers.authorization;
      // get email
      const decodedToken = jwt_decode(token);
      const { email } = decodedToken;
      const payment = await eventLogic.compraEvento(evento_id, {
        nombre_completo,
        f_nacimiento,
        pais,
        email,
        payment_method,
      });

      res.json({ payment });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/evento/:id", async (req, res) => {
    try {
      const token = req.headers.authorization;
      const { email } = jwt_decode(token);
      const fullUrl = req.get("host") + req.originalUrl;
      const userCan = await eventLogic.chekUserPayEvent(fullUrl, email);
      if (!userCan) {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Forbidden");
      }

      let events = await eventLogic.getByURL(fullUrl);
      res.json({ events });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/evento/:id/proveedor", async (req, res) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const { email } = jwt_decode(token);
      let events = await eventLogic.getEventInfoForProvider(
        parseInt(id),
        email
      );
      res.json({ events });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/evento_provider/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const { email } = jwt_decode(token);
      if (!email) {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Forbidden");
      }
      if (!id) {
        return res
          .status(HttpErrorCodes.ERROR_400_BAD_REQUEST)
          .send("Bad Request");
      }
      let event = await eventLogic.getEvent(parseInt(id));
      if (event.proveedor_email !== email) {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Forbidden");
      }
      let resp = await eventLogic.getOneEventInfo(parseInt(id));
      res.json({ resp });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/evento_admin", async (req, res) => {
    try {
      let resp = await eventLogic.getEventInfoForAdministrators();
      res.json({ resp });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
      return evalException(err, res);
    }
  });

  router.get("/unauthorized", async (req, res) => {
    try {
      let resp = await eventLogic.informUnautorizedCommingEvents();
      res.json({ resp });
    } catch (err) {
      console.log(
        `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
      );
    }
  });

};

module.exports = {
  startEventsRoutes,
};
