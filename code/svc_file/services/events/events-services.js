const { validate } = require("./validate-events");
const {
  ElementNotFoundException,
  ElementInvalidException,
} = require("../../exceptions/exceptions");
const { messageBinder } = require("./locale/locale-binder");
const PaymentServiceFactory = require("../paymets");
const { Op } = require("sequelize");

var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const getEvent = async function (id) {
  let event = await dbModels.Event.findByPk(id);
  if (!event) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return event;
};

const update = async function (id, event) {
  validate(event);
  let eventToUpdate = await dbModels.Event.findByPk(id);
  if (!eventToUpdate) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  // if autorizado, no se puede modificar
  if (eventToUpdate.autorizado) {
    throw new ElementInvalidException(messageBinder().cantUpdateIfAuth);
  }
  try {
    await dbModels.Event.update(event, { where: { id: id } });
  } catch (err) {
    console.log(
      "An error occurred while updating the event: " + JSON.stringify(err)
    );
    throw err;
  }
  return event;
};

const checkProviderEvent = async function (event_id, email) {
  let event = await dbModels.Event.findByPk(event_id);
  if (!event) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return event.proveedor_email === email;
};

const chekUserPayEvent = async function (file_url, email) {
  try {
    // get event where video_url or image_prin_url or image_min_url = file_url
    let event = await dbModels.Event.findOne({
      where: {
        [Op.or]: [
          { video_url: file_url },
          { imagen_prin_url: file_url },
          { imagen_min_url: file_url },
        ],
      },
    });
    if (!event) {
      return false;
    }
    if (event.f_fin < new Date() || event.f_inicio > new Date()) {
      return false;
    }
    const paymentService = PaymentServiceFactory.create("CustomPaymentService");
    const providePay = await paymentService.Check({
      proveedor_email: email,
      description: `buy-event-${event.id}`,
    });
    if (!providePay) {
      return false;
    }
    return providePay;
  } catch (err) {
    console.log(
      "An error occurred while checking if the user paid the event: " +
        JSON.stringify(err)
    );
    return false;
  }
};

module.exports = {
  update,
  getEvent,
  checkProviderEvent,
  chekUserPayEvent,
  setDbModels,
};
