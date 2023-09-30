/* get config */
const { locale } = require("../config/config");

const messageBinder = () => {
  let messageConfig;
  if (locale == "ES") {
    messageConfig = require("./es");
  } else if (locale == "EN") {
    messageConfig = require("./es");
  } else {
    messageConfig = require("./es");
  }
  return messageConfig.crudMessages;
};

module.exports = {
  messageBinder,
};
