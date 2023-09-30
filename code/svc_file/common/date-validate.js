const { ElementInvalidException } = require("../exceptions/exceptions");

const dateValidate = function (val, message) {
  if (isNaN(val)) {
    throw new ElementInvalidException(message);
  }
  return Number(val);
};

const dateInRangeValidate = function (valFrom, valTo, val, message) {
  dateValidate(valFrom, message);
  dateValidate(valTo, message);
  dateValidate(val, message);
  if (valFrom > val || val > valTo) {
    throw new ElementInvalidException(message);
  }
  return val;
};

module.exports = {
  dateValidate,
  dateInRangeValidate,
};
