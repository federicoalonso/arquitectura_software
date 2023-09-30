const { ElementInvalidException } = require("../exceptions/exceptions");

const throwExceptionIfEmptyString = function (val, message) {
  if (!val) {
    throw new ElementInvalidException(message);
  }
  if (val === "") {
    throw new ElementInvalidException(message);
  }
};

const thrrowErrorIfNotValidEmail = function (val, message) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!val.match(mailformat)) {
    throw new ElementInvalidException(message);
  }
};

const thrrowErrorIfMinLength = function (val, length, message) {
  if (val.length() < Number(length)) {
    throw new ElementInvalidException(message);
  }
};

const thrrowErrorIfMaxLength = function (val, length, message) {
  if (val.length() > Number(length)) {
    throw new ElementInvalidException(message);
  }
};

module.exports = {
  throwExceptionIfEmptyString,
  thrrowErrorIfNotValidEmail,
  thrrowErrorIfMinLength,
  thrrowErrorIfMaxLength,
};
