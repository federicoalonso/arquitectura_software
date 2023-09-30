const { validate } = require("./validate-events");
const {
  ElementNotFoundException,
  ElementInvalidException,
  ElementAlreadyExist,
} = require("../../exceptions/exceptions");
const { messageBinder } = require("./locale/locale-binder");
const {
  check_dates,
  regulatory_check,
  payment_check,
} = require("../../filters/filters");
const Pipeline = require("../../pipeline/pipeline");
const AuthEvent = require("../../data-access/mongo/models/events-autorization-model");
const {
  webServer,
  domain,
  emailQueue,
  emailAddress,
  svcLogURL,
  svcBitacoraURL,
  svcAuthURL,
  horasAlertaEventoNoAutorizado
} = require("../../conf/config")();
const uuid = require("uuid");
const { queue } = require("../../queues/queue-binder");
const processQueue = queue(emailQueue || "emailQueue");
const { Op } = require("sequelize");
const PaymentServiceFactory = require("../paymets");
const { sendToBitacora } = require("../bitacora");
const axios = require("axios");
const { sendToLog } = require("../logMiddleware");

var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const create = async function (event) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().EventCreationCall,
    messageBinder().serviceName,
    event
  );
  validate(event);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().EventValidated,
    messageBinder().serviceName,
    event
  );
  let newEvent = await dbModels.Event.create(event);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().EventCreated,
    messageBinder().serviceName,
    newEvent
  );
  bitacoraEventCreated(newEvent);
  return newEvent;
};

const getEvent = async function (id) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getEventCall,
    messageBinder().serviceName,
    id
  );
  let event = await dbModels.Event.findByPk(id);

  if (!event) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    event
  );
  return event;
};

const getByURL = async function (url) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getByURLCall,
    messageBinder().serviceName,
    url
  );
  let event = await dbModels.Event.findOne({ where: { evento_url: url } });
  if (!event) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      url
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    event
  );
  return event;
};

const getAll = async function () {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getAllCall,
    messageBinder().serviceName,
    {}
  );
  let events = await dbModels.Event.findAll();
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().eventsFounded,
    messageBinder().serviceName,
    events
  );
  return events;
};

const remove = async function (id) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().removeEventCall,
    messageBinder().serviceName,
    id
  );
  let eventToRemove = await dbModels.Event.findByPk(id);

  if (!eventToRemove) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    eventToRemove
  );
  try {
    await dbModels.Event.destroy({ where: { id: id } });
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().messageEventRemoved,
      messageBinder().serviceName,
      eventToRemove
    );
    bitacoraRemoveEvent(eventToRemove);
  } catch (err) {
    console.log(
      "An error occurred while removing the event: " + JSON.stringify(err)
    );
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileRemovingEvent,
      messageBinder().serviceName,
      err
    );
    throw err;
  }

  return;
};

const updateUnautorizedEvent = async function (id, event) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().updateUnautorizedEventCall,
    messageBinder().serviceName,
    {
      id: id,
      event: event,
    }
  );
  validate(event);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().EventValidated,
    messageBinder().serviceName,
    event
  );
  let eventToUpdate = await dbModels.Event.findByPk(id);

  if (!eventToUpdate) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    eventToUpdate
  );
  // if autorizado, no se puede modificar
  if (eventToUpdate.autorizado) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().eventToUpdateIsUnauthorized,
      messageBinder().serviceName,
      eventToUpdate
    );
    throw new ElementInvalidException(messageBinder().cantUpdateIfAuth);
  }
  try {
    await dbModels.Event.update(event, { where: { id: id } });
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().messageEventUpdated,
      messageBinder().serviceName,
      event
    );
    bitacoraEventUpdated(eventToUpdate);
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileUpdatingEvent,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
  return event;
};

const update = async function (id, event) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().updateEventCall,
    messageBinder().serviceName,
    {
      id: id,
      event: event,
    }
  );
  validate(event);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().EventValidated,
    messageBinder().serviceName,
    event
  );
  let eventToUpdate = await dbModels.Event.findByPk(id);
  if (!eventToUpdate) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    eventToUpdate
  );
  try {
    await dbModels.Event.update(event, { where: { id: id } });
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().messageEventUpdated,
      messageBinder().serviceName,
      event
    );
    bitacoraEventUpdated(eventToUpdate);
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileUpdatingEvent,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
  return event;
};

const authEvent = async function (id, auth) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().authEventCall,
    messageBinder().serviceName,
    {
      id: id,
      event: auth,
    }
  );
  let eventToAuth = await dbModels.Event.findByPk(id);
  if (!eventToAuth) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundEvent,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  if (eventToAuth.nombre != auth.event_name) {
    throw new ElementInvalidException(messageBinder().eventNotMatch);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvent,
    messageBinder().serviceName,
    eventToAuth
  );
  // find whrer email = proveedor_email
  let evetProvider = await dbModels.Provider.findOne({
    where: { email: eventToAuth.proveedor_email },
  });
  if (!evetProvider) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notFoundProvider,
      messageBinder().serviceName,
      eventToAuth.proveedor_email
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  if (evetProvider.name != auth.provider_name) {
    throw new ElementInvalidException(messageBinder().providerNotMatch);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundProvider,
    messageBinder().serviceName,
    evetProvider
  );
  try {
    if (!auth.auth_status) {
      let authEvent = new AuthEvent({
        event_name: eventToAuth.nombre,
        provider_name: evetProvider.name,
        auth_type: eventToAuth.tipo_aut,
        auth_date: Date.now(),
        auth_status: false,
        auth_description:
          "El evento no fue autorizado de forma explícita por el administrador " +
          auth.auth_by,
        auth_by: auth.auth_by,
      });
      await authEvent.save();
      let email = {
        event: eventToAuth.id,
        from: emailAddress,
        to: evetProvider.email,
        subject: "Evento no autorizado",
        body:
          "El evento " +
          eventToAuth.nombre +
          " no fue autorizado de forma explícita por el administrador " +
          auth.auth_by,
      };
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().messageEventUnauthorizedByAdmin,
        messageBinder().serviceName,
        { event: eventToAuth, provider: evetProvider }
      );
      bitacoraEventUnauthorizedByAdmin(eventToAuth);
      processQueue.add(email, { removeOnComplete: true });
      return;
    }

    // se pasa por el filtro de las fechas
    let filters = [];
    filters.push(check_dates);
    // se pasa por el filtro de unidad reguladora
    filters.push(regulatory_check);
    // se fija en auth el tipo de autorizacion
    // si es manual ya esta, si es automatica se agrega el filtro de la pasarela de pago
    if (auth.auth_type == "automatico") {
      filters.push(payment_check);
    }
    let pipeline = new Pipeline();
    for (let i = 0; i < filters.length; i++) {
      pipeline.use(filters[i]);
    }

    eventToAuth.tipo_aut = auth.auth_type;
    eventToAuth.description = `event-${eventToAuth.id}`;
    eventToAuth.auth_by = auth.auth_by;
    pipeline.run(eventToAuth);

    return new Promise((resolve, reject) => {
      pipeline.on("error", async (err) => {
        console.log(`The error is ${err}`);
        let authEvent = new AuthEvent({
          event_name: eventToAuth.nombre,
          provider_name: evetProvider.name,
          auth_type: eventToAuth.tipo_aut,
          auth_date: Date.now(),
          auth_status: false,
          auth_description: err.message,
          auth_by: auth.auth_by,
        });
        await authEvent.save();
        let email = {
          event: eventToAuth.id,
          from: emailAddress,
          to: evetProvider.email,
          subject: "Evento no autorizado",
          body:
            "El evento no fue autorizado por el siguiente motivo: " +
            err.message,
        };
        processQueue.add(email, { removeOnComplete: true });
        sendToLog(
          messageBinder().levelInfo,
          messageBinder().messageEventUnauthorized,
          messageBinder().serviceName,
          { event: eventToAuth, provider: evetProvider }
        );
        bitacoraEventUnauthorized(eventToAuth);
        reject(err);
      });

      pipeline.on("end", async (result) => {
        console.log(`The end message with id ${result} has finished`);
        console.log(`The end message with id ${result} has finished`);
        // si todo ok, valida el evento, genera la url y la guarda en mysql y mongo
        let authEvent = new AuthEvent({
          event_name: eventToAuth.nombre,
          provider_name: evetProvider.name,
          auth_type: eventToAuth.tipo_aut,
          auth_date: Date.now(),
          auth_status: true,
          auth_description: "Autorizado",
          auth_by: auth.auth_by,
        });
        let authEventObject = await authEvent.save();

        let uuidEvent = uuid.v4();

        // si no ok, guarda en mongo el error
        // se informa al usuario
        let email = {
          event: eventToAuth.id,
          from: emailAddress,
          to: evetProvider.email,
          subject: "Evento autorizado",
          body:
            "El evento " +
            eventToAuth.nombre +
            " fue autorizado por el administrador " +
            auth.auth_by,
        };
        processQueue.add(email, { removeOnComplete: true });
        sendToLog(
          messageBinder().levelInfo,
          messageBinder().messageEventAuthorizedByAdmin,
          messageBinder().serviceName,
          { event: eventToAuth, provider: evetProvider }
        );
        bitacoraEventAuthorizedByAdmin(eventToAuth);
        authEventObject.evento_url =
          domain +
          ":" +
          webServer.port +
          webServer.baseUrl +
          "/evento/" +
          uuidEvent;

        resolve(authEventObject);
      });
    }).catch((err) => {
      console.log(
        "An error occurred while updating the event: " + JSON.stringify(err)
      );
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorWhileAuthorizing,
        messageBinder().serviceName,
        err
      );
      throw err;
    });
  } catch (err) {
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileAuthorizing,
      messageBinder().serviceName,
      err
    );
    throw err;
  }
};

const getAuthorizedEvents = async function () {
  const queryRequestTimestamp = new Date();
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getAuthorizedEventsCall,
    messageBinder().serviceName,
    {}
  );
  let events = await dbModels.Event.findAll({
    where: {
      autorizado: true,
      f_fin: {
        [Op.gte]: new Date(),
      },
    },
  });
  let evs = [];
  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let clientSubscribed = await dbModels.ClientEvent.findAll({
      where: {
        event_id: event.id,
      },
    });
    evs.push({
      id: event.id,
      nombre: event.nombre,
      descripcion: event.descripcion,
      f_inicio: event.f_inicio,
      f_fin: event.f_fin,
      precio: event.precio,
      categoria: event.categoria,
      cantidad_suscriptores: clientSubscribed.length,
      queryRequestTimestamp: queryRequestTimestamp,
      queryResponseTimestamp: new Date(),
      queryProcessingTime: new Date() - queryRequestTimestamp,
    });
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().foundEvents,
    messageBinder().serviceName,
    evs
  );

  return evs;
};

const createClient = async function (email) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().createClientCall,
      messageBinder().serviceName,
      email
    );
    let clientObject = {
      email: email,
    };
    let clientSaved = await dbModels.Client.create(clientObject);
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().savedClient,
      messageBinder().serviceName,
      clientSaved
    );
    return clientSaved;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileSavingClient,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
};

const addPaymentMethod = async function (id, client) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().addPaymentMethodCall,
      messageBinder().serviceName,
      {
        id: id,
        client: client,
      }
    );
    let client_to_update = await dbModels.Client.findByPk(id);
    if (!client_to_update) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundClient,
        messageBinder().serviceName,
        id
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundClient,
      messageBinder().serviceName,
      client_to_update
    );
    await dbModels.Client.update(client, { where: { id: id } });
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().paymentMethodAdded,
      messageBinder().serviceName,
      client
    );
    return client;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileAddingPaymentMethod,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
};

const getClient = async function (id) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getClient,
    messageBinder().serviceName,
    id
  );
  try {
    let client = await dbModels.Client.findByPk(id);
    if (!client) {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().notFoundClient,
        messageBinder().serviceName,
        id
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundClient,
      messageBinder().serviceName,
      client
    );
    return client;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileGettingClient,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while getting the client: " + JSON.stringify(err)
    );
    throw err;
  }
};

const suscribeToEvent = async function (id, clien_id) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().suscribeToEventCall,
      messageBinder().serviceName,
      {
        eventId: id,
        clientId: clien_id,
      }
    );
    let client = await dbModels.Client.findOne({
      where: {
        id: clien_id,
      },
    });
    if (!client) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundClient,
        messageBinder().serviceName,
        {
          eventId: id,
          clientId: clien_id,
        }
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundClient,
      messageBinder().serviceName,
      client
    );
    let clientEvent = await dbModels.ClientEvent.findOne({
      where: {
        client_id: clien_id,
        event_id: id,
      },
    });
    if (clientEvent) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().clientEventAlreadyExist,
        messageBinder().serviceName,
        clientEvent
      );
      throw new ElementAlreadyExist(messageBinder().alreadyExists);
    }
    let event = await dbModels.Event.findByPk(id);

    if (!event) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundEvent,
        messageBinder().serviceName,
        id
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundEvent,
      messageBinder().serviceName,
      event
    );
    let clientEventObject = {
      client_id: clien_id,
      event_id: id,
    };
    let clientEventSaved = await dbModels.ClientEvent.create(clientEventObject);
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().messageClientSubscribed,
      messageBinder().serviceName,
      clientEventSaved
    );
    bitacoraClientSubscribedToEvent(event, client);
    return clientEventSaved;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileSubscribing,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
};

const sendMessageToSuscribers = async function (
  event_id,
  message,
  provider_email
) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().sendMessageToSuscribers,
      messageBinder().serviceName,
      { eventId: event_id, message: message, providerEmail: provider_email }
    );
    let clients_id = await dbModels.ClientEvent.findAll({
      where: {
        event_id: event_id,
      },
    });
    let clients = [];
    for (let i = 0; i < clients_id.length; i++) {
      let client = await dbModels.Client.findByPk(clients_id[i].client_id);
      clients.push(client);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundedRecipients,
      messageBinder().serviceName,
      clients
    );

    let event = await dbModels.Event.findByPk(event_id);
    if (!event) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundEvent,
        messageBinder().serviceName,
        event_id
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    if (provider_email != event.proveedor_email) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().providerIsNotTheOwnerOfEvent,
        messageBinder().serviceName,
        { providerEmail: provider_email, ownerEmail: event.proveedor_email }
      );
      throw new ElementInvalidException(messageBinder().notAutorizad);
    }

    for (let i = 0; i < clients.length; i++) {
      let email = {
        event: event_id,
        from: emailAddress,
        to: clients[i].email,
        subject: "Actualización de evento " + event.nombre,
        body: message,
      };
      processQueue.add(email, { removeOnComplete: true });
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().clientsAddedForDelivery,
        messageBinder().serviceName,
        clients
      );
    }
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileGeneratingEmails,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
};

const compraEvento = async function (event_id, client) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().compraEvento,
      messageBinder().serviceName,
      {
        client: client,
        event: event_id,
      }
    );
    let event = await dbModels.Event.findByPk(event_id);
    if (!event) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundEvent,
        messageBinder().serviceName,
        {
          client: client,
          event: event_id,
        }
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundEvent,
      messageBinder().serviceName,
      event
    );
    let clientDb = await dbModels.Client.findOne({
      where: {
        email: client.email,
      },
    });
    if (!clientDb) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundClient,
        messageBinder().serviceName,
        {
          client: client,
          event: event,
        }
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().foundClient,
      messageBinder().serviceName,
      clientDb
    );
    // update client info
    let f_nac = new Date(client.f_nacimiento);
    await dbModels.Client.update(
      {
        nombre_completo: client.nombre_completo,
        email: clientDb.email,
        pais: client.pais,
        f_nacimiento: f_nac,
        payment_method: client.payment_method,
      },
      { where: { id: clientDb.id } }
    );
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().clientInfoUpdated,
      messageBinder().serviceName,
      {
        nombre_completo: client.nombre_completo,
        email: clientDb.email,
        pais: client.pais,
        f_nacimiento: f_nac,
        payment_method: client.payment_method,
      }
    );
    // search client event
    let clientEvent = await dbModels.ClientEvent.findOne({
      where: {
        client_id: clientDb.id,
        event_id: event_id,
      },
    });
    if (!clientEvent) {
      // create client event
      let clientEventObject = {
        client_id: clientDb.id,
        event_id: event_id,
      };
      await dbModels.ClientEvent.create(clientEventObject);
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().messageClientPurchasedAnEvent,
        messageBinder().serviceName,
        clientEventObject
      );
    }

    let provider = await dbModels.Provider.findOne({
      where: {
        email: event.proveedor_email,
      },
    });

    // create payment
    const paymentService = PaymentServiceFactory.create(client.payment_method);
    const providePay = await paymentService.Pay({
      payment_email: client.email,
      payment_description: `buy-event-${event_id}`,
      payment_amount: provider.price,
    });
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().messageClientPurchasedAnEvent,
      messageBinder().serviceName,
      { event: event, client: clientDb }
    );
    bitacoraClientPurchasedAnEvent(event, clientDb);
    return providePay;
  } catch (err) {
    console.log(
      "An error occurred while buying the event: " + JSON.stringify(err)
    );
    throw err;
  }
};

const chekUserPayEvent = async function (evento_url, email) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().chekUserPayEventCall,
      messageBinder().serviceName,
      { event: evento_url, client: email }
    );
    let event = await dbModels.Event.findOne({
      where: { evento_url: evento_url },
    });
    if (!event) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundEvent,
        messageBinder().serviceName,
        { event: evento_url, client: email }
      );
      return false;
    }
    if (event.f_fin < new Date() || event.f_inicio > new Date()) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().eventOutOfDate,
        messageBinder().serviceName,
        { event: event, client: email }
      );
      return false;
    }
    const paymentService = PaymentServiceFactory.create("CustomPaymentService");
    const providePay = await paymentService.Check({
      proveedor_email: email,
      description: `buy-event-${event.id}`,
    });
    if (!providePay) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().paymentMethodNotSupported,
        messageBinder().serviceName,
        {
          proveedor_email: email,
          description: `buy-event-${event.id}`,
        }
      );
      return false;
    }
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().paymentMethodProvider,
      messageBinder().serviceName,
      providePay
    );
    return providePay;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileCheckingPayment,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while checking if the user paid the event: " +
        JSON.stringify(err)
    );
    return false;
  }
};

const getEventInfoForProvider = async function (id, email) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getEventInfoForProviderCall,
      messageBinder().serviceName,
      { id: id, email: email }
    );
    let queryRequestTimestamp = new Date();
    let provider = await dbModels.Provider.findByPk(id);
    if (!provider) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().notFoundProvider,
        messageBinder().serviceName,
        { id: id, email: email }
      );
      throw new ElementNotFoundException(messageBinder().notFound);
    }
    if (provider.email != email) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().providerIsNotTheOwnerOfEvent,
        messageBinder().serviceName,
        { ownerEmail: provider.email, emailReceived: email }
      );
      throw new ElementInvalidException(messageBinder().notAutorizad);
    }
    let events = await dbModels.Event.findAll({
      where: {
        proveedor_email: provider.email,
      },
    });

    let response = {
      queryRequestTimestamp: queryRequestTimestamp,
      events: [],
    };

    let aprovados = 0;
    let rechazados = 0;

    // hago un arreglo con los id de los eventos
    let events_id = {
      ids: [],
    };
    let urls = {
      urls: [],
    };
    for (let i = 0; i < events.length; i++) {
      let ev = {
        id: events[i].id,
        proveedor_email: events[i].proveedor_email,
        nombre: events[i].nombre,
        descripcion: events[i].descripcion,
        f_inicio: events[i].f_inicio,
        f_fin: events[i].f_fin,
        imagen_min_url: events[i].imagen_min_url,
        imagen_prin_url: events[i].imagen_prin_url,
        video_url: events[i].video_url,
        categoria: events[i].categoria,
        tipo_aut: events[i].tipo_aut,
        autorizado: events[i].autorizado,
        evento_url: events[i].evento_url,
        created_at: events[i].created_at,
        updated_at: events[i].updated_at,
      };
      if (events[i].autorizado) {
        aprovados++;
        events_id.ids.push(events[i].id);
        if (events[i].video_url) {
          urls.urls.push(events[i].video_url);
        }
        let suscribedClients = await dbModels.ClientEvent.findAll({
          where: {
            event_id: events[i].id,
          },
        });
        ev.suscribedClients = suscribedClients.length;
        urls.urls.push(`http://localhost/svc_evento/compra/${events[i].id}/`);
      } else {
        rechazados++;
      }
      response.events.push(ev);
    }

    response.aprovados = aprovados;
    response.rechazados = rechazados;

    const eamilInfo = await axios({
      method: "post",
      url: `${svcLogURL}getEmailStatistics`,
      data: events_id,
    });

    const urlsInfo = await axios({
      method: "post",
      url: `${svcLogURL}getURLStatistics`,
      data: urls,
    });

    for (let i = 0; i < response.events.length; i++) {
      // map response.events[i].video_url to urlsInfo.video_url
      let urlInfo = urlsInfo.data.find(
        (url) => url.url === response.events[i].video_url
      );
      if (urlInfo) {
        response.events[i].tiempo_promedio = urlInfo.tiempo_promedio;
        response.events[i].concurrencia_maxima = urlInfo.concurrencia_maxima;
      }
      let buyInfo = urlsInfo.data.find(
        (url) =>
          url.url ===
          "http://localhost/svc_evento/compra/" + response.events[i].id + "/"
      );
      if (buyInfo) {
        response.events[i].tiempo_promedio_compra = buyInfo.tiempo_promedio;
      }

      let mailInfo = eamilInfo.data.find(
        (email) => email.id === response.events[i].id
      );
      if (mailInfo) {
        response.events[i].mails_enviados = mailInfo.correctos;
        response.events[i].mails_rebotados = mailInfo.fallidos;
      }
    }

    let queryResponseTimestamp = new Date();
    let queryResponseTime = queryResponseTimestamp - queryRequestTimestamp;
    response.queryResponseTimestamp = queryResponseTimestamp;
    response.queryProcessingTime = queryResponseTime;
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getEventInfoForProviderResponse,
      messageBinder().serviceName,
      response
    );
    return response;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileGettingInfoOfEvents,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while getting the event for provider: " +
        JSON.stringify(err)
    );
    throw err;
  }
};

const getEventInfoForAdminBitacora = async function (from, until) {
  try {
    let queryRequestTimestamp = new Date();
    let response = {
      eventos_aprobados: {},
      eventos_desaprobados: {},
    };
    let getManualApprovedEvents = await dbModels.Event.findAll({
      where: {
        autorizado: true,
        tipo_aut: "manual",
      },
    });
    let authApprovedEvents = await dbModels.Event.findAll({
      where: {
        autorizado: true,
        tipo_aut: "automatico",
      },
    });
    response.eventos_aprobados.maual = getManualApprovedEvents;
    response.eventos_aprobados.automatico = authApprovedEvents;
    let getRejectedEvents = await dbModels.Event.findAll({
      where: {
        autorizado: false,
      },
    });
    response.eventos_desaprobados = getRejectedEvents;

    let cantidadPendienteAprobacion = await dbModels.Event.count({
      where: {
        autorizado: false,
        f_inicio: {
          [Op.gte]: new Date(),
        },
      },
    });
    response.cantidad_pendiente_aprobacion = cantidadPendienteAprobacion;

    let url = `${svcBitacoraURL}bitacora?from=${from}&until=${until}`;

    if (!from && !until) {
      url = `${svcBitacoraURL}bitacora`;
    }

    const bitacora_data = await axios({
      method: "get",
      url: url,
    });

    let eventos_registrados = 0;
    let cantidad_aprobados_manual = 0;
    let cantidad_aprobados_automatico = 0;
    let cantidad_desaprobados = 0;
    let cantidad_suscripciones = 0;

    for (let i = 0; i < bitacora_data.data.length; i++) {
      if (bitacora_data.data[i].action == "Evento creado") {
        eventos_registrados++;
      } else if (
        bitacora_data.data[i].action == "Evento autorizado por administrador"
      ) {
        if (bitacora_data.data[i].message == "manual") {
          cantidad_aprobados_manual++;
        } else {
          cantidad_aprobados_automatico++;
        }
      } else if (
        bitacora_data.data[i].action == "Evento desautorizado por administrador"
      ) {
        cantidad_desaprobados++;
      } else if (bitacora_data.data[i].action == "Cliente suscrito a evento") {
        cantidad_suscripciones++;
      }
    }

    response.eventos_registrados = eventos_registrados;
    response.cantidad_aprobados_manual = cantidad_aprobados_manual;
    response.cantidad_aprobados_automatico = cantidad_aprobados_automatico;
    response.cantidad_desaprobados = cantidad_desaprobados;
    response.cantidad_suscripciones = cantidad_suscripciones;

    let queryResponseTimestamp = new Date();
    let queryResponseTime = queryResponseTimestamp - queryRequestTimestamp;

    response.queryRequestTimestamp = queryRequestTimestamp;
    response.queryResponseTimestamp = queryResponseTimestamp;
    response.queryProcessingTime = queryResponseTime;

    return response;
  } catch (err) {
    console.log(
      "An error occurred while getting the event for provider: " +
        JSON.stringify(err)
    );
    throw err;
  }
};

const getOneEventInfo = async function (id) {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getOneEventInfoCall,
      messageBinder().serviceName,
      id
    );
    let event = await dbModels.Event.findByPk(id);
    let queryRequestTimestamp = new Date();

    let response = {
      queryRequestTimestamp: queryRequestTimestamp,
    };

    let events_id = {
      ids: [id],
    };
    let urls = {
      urls: [],
    };
    let ev = {
      id: event.id,
      proveedor_email: event.proveedor_email,
      nombre: event.nombre,
      descripcion: event.descripcion,
      f_inicio: event.f_inicio,
      f_fin: event.f_fin,
      imagen_min_url: event.imagen_min_url,
      imagen_prin_url: event.imagen_prin_url,
      video_url: event.video_url,
      categoria: event.categoria,
      tipo_aut: event.tipo_aut,
      autorizado: event.autorizado,
      evento_url: event.evento_url,
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
    if (event.autorizado) {
      if (event.video_url) {
        urls.urls.push(event.video_url);
      }
      let suscribedClients = await dbModels.ClientEvent.findAll({
        where: {
          event_id: event.id,
        },
      });
      ev.suscribedClients = suscribedClients.length;
      urls.urls.push(`http://localhost/svc_evento/compra/${event.id}/`);

      const eamilInfo = await axios({
        method: "post",
        url: `${svcLogURL}getEmailStatistics`,
        data: events_id,
      });

      const urlsInfo = await axios({
        method: "post",
        url: `${svcLogURL}getURLStatistics`,
        data: urls,
      });

      let urlInfo = urlsInfo.data.find((url) => url.url === ev.video_url);
      if (urlInfo) {
        ev.tiempo_promedio = urlInfo.tiempo_promedio;
        ev.concurrencia_maxima = urlInfo.concurrencia_maxima;
      }
      let buyInfo = urlsInfo.data.find(
        (url) => url.url === "http://localhost/svc_evento/compra/" + ev.id + "/"
      );
      if (buyInfo) {
        ev.tiempo_promedio_compra = buyInfo.tiempo_promedio;
      }

      let mailInfo = eamilInfo.data.find((email) => email.id === ev.id);
      if (mailInfo) {
        ev.mails_enviados = mailInfo.correctos;
        ev.mails_rebotados = mailInfo.fallidos;
      }
    }

    response.event = ev;

    let queryResponseTimestamp = new Date();
    let queryResponseTime = queryResponseTimestamp - queryRequestTimestamp;
    response.queryResponseTimestamp = queryResponseTimestamp;
    response.queryProcessingTime = queryResponseTime;
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getOneEventInfoResponse,
      messageBinder().serviceName,
      response
    );
    return response;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileGettingInfoOfEvent,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while getting the event for provider: " +
        JSON.stringify(err)
    );
    throw err;
  }
};

const getEventInfoForAdministrators = async function () {
  try {
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getEventInfoForAdministratorsCall,
      messageBinder().serviceName,
      {}
    );
    let queryRequestTimestamp = new Date();

    let events = await dbModels.Event.findAll({
      where: {
        autorizado: true,
      },
    });

    let response = {
      queryRequestTimestamp: queryRequestTimestamp,
      events: [],
    };

    let urls = {
      urls: [],
    };
    for (let i = 0; i < events.length; i++) {
      let ev = {
        id: events[i].id,
        proveedor_email: events[i].proveedor_email,
        nombre: events[i].nombre,
        descripcion: events[i].descripcion,
        f_inicio: events[i].f_inicio,
        f_fin: events[i].f_fin,
        imagen_min_url: events[i].imagen_min_url,
        imagen_prin_url: events[i].imagen_prin_url,
        video_url: events[i].video_url,
        categoria: events[i].categoria,
        tipo_aut: events[i].tipo_aut,
        autorizado: events[i].autorizado,
        evento_url: events[i].evento_url,
        created_at: events[i].created_at,
        updated_at: events[i].updated_at,
      };

      if (events[i].video_url) {
        urls.urls.push(events[i].video_url);
      }
      let suscribedClients = await dbModels.ClientEvent.findAll({
        where: {
          event_id: events[i].id,
        },
      });
      ev.suscribedClients = suscribedClients.length;

      response.events.push(ev);
    }

    const urlsInfo = await axios({
      method: "post",
      url: `${svcLogURL}getURLStatistics`,
      data: urls,
    });

    for (let i = 0; i < response.events.length; i++) {
      // map response.events[i].video_url to urlsInfo.video_url
      let urlInfo = urlsInfo.data.find(
        (url) => url.url === response.events[i].video_url
      );
      if (urlInfo) {
        response.events[i].tiempo_promedio = urlInfo.tiempo_promedio;
        response.events[i].concurrencia_maxima = urlInfo.concurrencia_maxima;
      }
    }

    let queryResponseTimestamp = new Date();
    let queryResponseTime = queryResponseTimestamp - queryRequestTimestamp;
    response.queryResponseTimestamp = queryResponseTimestamp;
    response.queryProcessingTime = queryResponseTime;
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().getEventInfoForAdministratorsResponse,
      messageBinder().serviceName,
      response
    );
    return response;
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileGettingAdminInfo,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while getting the event for administrator: " +
        JSON.stringify(err)
    );
    throw err;
  }
};

function bitacoraEventCreated(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventCreated,
    message: messageBinder().messageEventCreated,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraEventUpdated(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventUpdated,
    message: messageBinder().messageEventUpdated,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraRemoveEvent(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventRemoved,
    message: messageBinder().messageEventRemoved,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraEventAuthorizedByAdmin(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventAuthorizedByAdmin,
    message: event.tipo_aut,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraEventUnauthorizedByAdmin(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventUnauthorizedByAdmin,
    message: event.tipo_aut,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraEventUnauthorized(event) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionEventUnauthorizedByAdmin,
    message: event.tipo_aut,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
  });
}

function bitacoraClientSubscribedToEvent(event, client) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionClientSubscribed,
    message: messageBinder().messageClientSubscribed,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
    optional: client,
  });
}
function bitacoraClientPurchasedAnEvent(event, client) {
  sendToBitacora({
    level: messageBinder().levelInfo,
    action: messageBinder().actionClientPurchasedAnEvent,
    message: messageBinder().messageClientPurchasedAnEvent,
    email: event.proveedor_email,
    event: event,
    service: messageBinder().service,
    optional: client,
  });
}

async function informUnautorizedCommingEvents() {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getAllCall,
    messageBinder().serviceName,
    {}
  );
  // find events not authorized and will start in the next 168 hours
  let events = await dbModels.Event.findAll({
    where: {
      autorizado: false,
      f_inicio: {
        [Op.between]: [
          new Date(),
          new Date(new Date().getTime() + horasAlertaEventoNoAutorizado * 60 * 60 * 1000),
        ],
      },
    },
  });

  // get list of admins from svc_auth
  let admins = await axios({
    method: "get",
    url: `${svcAuthURL}users/admins`,
  });

  // send email to each admin
  for (let i = 0; i < admins.data.length; i++) {
    let admin = admins.data[i];
    let email = {
      from: emailAddress,
      to: admin.email,
      subject: "Eventos no autorizado a " + horasAlertaEventoNoAutorizado + " horas de su inicio",
      body:
        "Los siguientes eventos no han sido autorizados y comenzarán en los próximos 7 días: \n" +
        JSON.stringify(events) +
        "\nPor favor, autorizarlos o rechazarlos."
    };
    processQueue.add(email, { removeOnComplete: true });
  }

  sendToLog(
    messageBinder().levelInfo,
    messageBinder().eventsFounded,
    messageBinder().serviceName,
    events
  );
  return events;
}

module.exports = {
  create,
  getAll,
  update,
  remove,
  getEvent,
  authEvent,
  updateUnautorizedEvent,
  getAuthorizedEvents,
  suscribeToEvent,
  createClient,
  sendMessageToSuscribers,
  addPaymentMethod,
  getClient,
  compraEvento,
  chekUserPayEvent,
  getByURL,
  getEventInfoForProvider,
  getOneEventInfo,
  getEventInfoForAdministrators,
  getEventInfoForAdminBitacora,
  informUnautorizedCommingEvents,
  setDbModels,
};
