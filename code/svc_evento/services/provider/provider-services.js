const { ElementNotFoundException } = require("../../exceptions/exceptions");
const { messageBinder } = require("../events/locale/locale-binder");

var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const get = async function (id) {
  let provider = await dbModels.Provider.findByPk(id);
  if (!provider) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return provider;
};

const getByEmail = async function (email) {
  let provider = await dbModels.Provider.findOne({ where: { email: email } });
  if (!provider) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return provider;
};

module.exports = {
  get,
  getByEmail,
  setDbModels,
};
