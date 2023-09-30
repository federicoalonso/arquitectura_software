const { ElementInvalidException } = require("../exceptions/exceptions");

const thrrowErrorIfNotValidEmail = function (email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new ElementInvalidException("Email is invalid");
  }
  return email;
};

module.exports = {
  thrrowErrorIfNotValidEmail,
};
