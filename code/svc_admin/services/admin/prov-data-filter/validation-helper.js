const { toNumberOrExeption } = require("../../../common/number-validate");
const {
  thrrowErrorIfNotValidEmail,
} = require("../../../common/email-validate");
const {
  throwExceptionIfEmptyString,
} = require("../../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../../common/object-validate");
const {
  throwExeptionIfNotHasProperty,
} = require("../../../common/object-validate");
const { throwExeptionIfEmpty } = require("../../../common/object-validate");
const { validCountry } = require("./filter-country-city-currency");
const { validCity } = require("./filter-country-city-currency");
const { validCucrrency } = require("./filter-country-city-currency");
const { validCucrrencyCode } = require("./filter-country-city-currency");
const { validCucrrencySymbol } = require("./filter-country-city-currency");
const { messageBinder } = require("../locale/locale-binder");

const validateDefined = (provider) => {
  throwExeptionIfUndefined(provider, messageBinder().providerIsMissing);
};

const validateNumber = (provider) => {
  toNumberOrExeption(provider.price, messageBinder().invalidNumberFormat);
};

const validateName = (provider) => {
  throwExeptionIfNotHasProperty(
    provider,
    "name",
    messageBinder().nameIsMissing
  );
  throwExeptionIfEmpty(provider.name, messageBinder().nameIsMissing);
};

const validateCountry = (provider) => {
  throwExeptionIfNotHasProperty(
    provider,
    "country",
    messageBinder().countryIsInvalid
  );
  console.log("validando pais");
  validCountry(provider.country, messageBinder().countryIsInvalid);
};

const validateCity = (provider) => {
  validCity(provider.country, provider.city, messageBinder().cityIsInvalid);
};

const validateCucrrency = (provider) => {
  validCucrrency(
    provider.country,
    provider.currency,
    messageBinder().currencyIsInvalid
  );
};

const validateCucrrencySymbol = (provider) => {
  validCucrrencySymbol(
    provider.country,
    provider.currency,
    provider.currencySymbol,
    messageBinder().currencySymbolIsInvalid
  );
};

const validateCucrrencyCode = (provider) => {
  validCucrrencyCode(
    provider.country,
    provider.currencyCode,
    messageBinder().currencyCodeIsInvalid
  );
};

const validateEmail = (provider) => {
  throwExeptionIfUndefined(provider.email, messageBinder().emailIsMissing);
  throwExeptionIfNotHasProperty(
    provider,
    "email",
    messageBinder().emailIsMissing
  );
  throwExceptionIfEmptyString(provider.email, messageBinder().emailIsMissing);
  thrrowErrorIfNotValidEmail(
    provider.email,
    messageBinder().invalidEmailFormat
  );
};

const validate = (provider) => {
  validateDefined(provider);
  validateName(provider);
  validateNumber(provider);
  validateCountry(provider);
  validateCity(provider);
  validateCucrrency(provider);
  validateCucrrencySymbol(provider);
  validateCucrrencyCode(provider);
  validateEmail(provider);
};

module.exports = {
  validate,
};
