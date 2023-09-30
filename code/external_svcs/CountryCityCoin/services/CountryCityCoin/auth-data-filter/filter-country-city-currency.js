let countryDataProvider = require('./country-data-provider')
const { throwExeptionIfUndefined } = require('../../../common/object-validate')
const { ElementInvalidException } = require('../../../exceptions/exceptions')

function getObjectByPropertyValue(collection, property, value) {
  return collection.find((obj) => obj[property] === value)
}

const validCountry = function (country, message) {
  let countries = countryDataProvider.getAllCountries()
  let countryExists = getObjectByPropertyValue(
    countries,
    'name',
    country.country
  )
  if (countryExists === undefined) {
    throwExeptionIfUndefined(countryExists, message)
  }
  return countryExists
}

const validCity = function (country, city, message) {
  let countries = countryDataProvider.getAllCountries()
  let countryExists = getObjectByPropertyValue(countries, 'name', country)
  if (countryExists) {
    let isoCode = countryExists.isoCode
    let cities = countryDataProvider.getCitiesByCountryCode(isoCode)
    let cityExists = getObjectByPropertyValue(cities, 'name', city)

    if (cityExists === undefined) {
      throwExeptionIfUndefined(cityExists, message)
    }
  }
}

const validCucrrency = function (country, currency, message) {
  let countries = countryDataProvider.getAllCountries()
  let countryExists = getObjectByPropertyValue(countries, 'name', country)
  if (countryExists) {
    // considera que la moneda sea solamente la del pais donde está el proveedor
    let currenciesData = countryDataProvider.getCurrencyDataFromCountryName(
      countryExists.name
    )
    let currencyExists = getObjectByPropertyValue(
      currenciesData,
      'currency',
      currency
    )
    if (currencyExists === undefined) {
      throwExeptionIfUndefined(currencyExists, message)
    }
  }
}

const validCucrrencyCode = function (country, currencyCode, message) {
  let countries = countryDataProvider.getAllCountries()
  let countryExists = getObjectByPropertyValue(countries, 'name', country)
  if (countryExists) {
    // considera que la moneda sea solamente la del pais donde está el proveedor
    let currenciesData = countryDataProvider.getCurrencyDataFromCountryName(
      countryExists.name
    )
    let currencyExists = getObjectByPropertyValue(
      currenciesData,
      'code',
      currencyCode
    )
    if (currencyExists === undefined) {
      throwExeptionIfUndefined(currencyExists, message)
    }
  }
}

const validCucrrencySymbol = function (
  country,
  currency,
  currencySymbol,
  message
) {
  let countries = countryDataProvider.getAllCountries()
  let countryExists = getObjectByPropertyValue(countries, 'name', country)
  if (countryExists) {
    // considera que la moneda sea solamente la del pais donde está el proveedor
    let currenciesData = countryDataProvider.getCurrencyDataFromCountryName(
      countryExists.name
    )
    let currencyExists = getObjectByPropertyValue(
      currenciesData,
      'currency',
      currency
    )
    if (currencyExists) {
      let correctCurrencySymbol = countryDataProvider.getCurrencySymbol(
        currencyExists.code
      )
      if (correctCurrencySymbol !== currencySymbol) {
        throw new ElementInvalidException(message)
      }
    }
  }
}

module.exports = {
  validCountry,
  validCity,
  validCucrrency,
  validCucrrencyCode,
  validCucrrencySymbol
}
