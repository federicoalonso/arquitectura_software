const jwt = require('jsonwebtoken')
const authorizationSimulator = require('./auth-data-filter/auth-simulator')
const validationHelper = require('./auth-data-filter/validation-helper')
const dataProvider = require('./auth-data-filter/country-data-provider')

async function getCityAndCurrencyDetailsByCountry(aCountry) {
  let validatedCountry = validationHelper.validateCountry(aCountry)
  let currencyData = dataProvider.getCurrencyDataFromCountryName(
    aCountry.country
  )
  let currencySymbol = dataProvider.getCurrencySymbol(validatedCountry.currency)
  let cities = dataProvider.getCitiesByCountryCode(validatedCountry.isoCode)
  const response = {
    validatedCountry: validatedCountry,
    currencySymbol: currencySymbol,
    currencyData: currencyData,
    cities: cities
  }
  return response
}

module.exports = {
  getCityAndCurrencyDetailsByCountry
}
