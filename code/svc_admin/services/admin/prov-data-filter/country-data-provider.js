let Country = require("country-state-city").Country;
let City = require("country-state-city").City;
const CountryCurrencyMapper = require("country-currency-map");
const getSymbolFromCurrency = require("currency-symbol-map");
const CurrencyDataProvider = require("currency-codes");

function getAllCountries() {
  let countries = Country.getAllCountries();
  return countries;
}

function getCitiesByCountryCode(countryCode) {
  let cities = City.getCitiesOfCountry(countryCode);
  return cities;
}
function getCurrencyList() {
  let currencyList = CountryCurrencyMapper.getCurrencyList();
  return currencyList;
}

function getCurrencySymbol(currencyAbbreviation) {
  let currencySymbol = getSymbolFromCurrency(currencyAbbreviation);
  return currencySymbol;
}

function getCurrencyAbbreviationFromName(currencyName) {
  let abbreviation =
    CountryCurrencyMapper.getCurrencyAbbreviationFromName(currencyName);
  return abbreviation;
}

function getCurrencyAbbreviationFromCountryName(countryName) {
  let currencyAbbreviation =
    CountryCurrencyMapper.getCurrencyAbbreviation(countryName);
  console.log(currencyAbbreviation);
  return currencyAbbreviation;
}

function getCurrencyDataFromAbbreviation(countryAbbreviation) {
  let currencyData = CountryCurrencyMapper.getCurrency(countryAbbreviation);
  return currencyData;
}

function getCurrencyDataFromCountryName(countryName) {
  let currencyData = CurrencyDataProvider.country(countryName);
  return currencyData;
}

module.exports = {
  getAllCountries,
  getCitiesByCountryCode,
  getCurrencyAbbreviationFromName,
  getCurrencySymbol,
  getCurrencyList,
  getCurrencyAbbreviationFromCountryName,
  getCurrencyDataFromAbbreviation,
  getCurrencyDataFromCountryName,
};
