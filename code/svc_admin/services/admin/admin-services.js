const { validate } = require("../admin/prov-data-filter/validation-helper");
const {
  ElementAlreadyExist,
  ElementInvalidException,
} = require("../../exceptions/exceptions");
const { messageBinder } = require("./locale/locale-binder");
const { sendToLog } = require("../../services/logMiddleware");

var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const saveProvider = async function (provider) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().saveProviderCall,
    messageBinder().serviceName,
    provider
  );
  if (provider) {
    let providerExists = await dbModels.Providers.findOne({
      where: {
        email: provider.email,
      },
    });
    if (!providerExists) {
      providerExists = await dbModels.Providers.findOne({
        where: {
          name: provider.name,
        },
      });
    }
    if (providerExists) {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().alreadyExist,
        messageBinder().serviceName,
        providerExists
      );
      throw new ElementAlreadyExist(messageBinder().alreadyExist);
    }
  }
  let newProvider = await dbModels.Providers.create(provider);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().providerCreated,
    messageBinder().serviceName,
    newProvider
  );
  return newProvider;
};

function createProvider(provider) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().createProviderCall,
    messageBinder().serviceName,
    provider
  );
  try {
    validate(provider);
    sendToLog(
      messageBinder().levelInfo,
      messageBinder().providerValidated,
      messageBinder().serviceName,
      provider
    );
    return saveProvider(provider);
  } catch (error) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().providerCreationError,
      messageBinder().serviceName,
      error
    );
    throw new ElementInvalidException(error.message);
  }
}

module.exports = {
  createProvider,
  setDbModels,
};
