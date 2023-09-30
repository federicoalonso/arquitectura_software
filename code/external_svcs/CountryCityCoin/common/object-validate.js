const { ElementInvalidException } = require('../exceptions/exceptions')

const throwExeptionIfNotHasProperty = function (object, property, message) {
  throwExeptionIfUndefined(object, message)
  if (!object.hasOwnProperty(property)) {
    throw new ElementInvalidException(message)
  } else {
    if (object.property === '') {
      throw new ElementInvalidException(message)
    }
  }
}

const throwExeptionIfEmpty = function (property, message) {
  if (property === '') {
    throw new ElementInvalidException(message)
  }
}

const throwExeptionIfUndefined = function (object, message) {
  if (!object || object === undefined) {
    throw new ElementInvalidException(message)
  }
}

module.exports = {
  throwExeptionIfNotHasProperty,
  throwExeptionIfUndefined,
  throwExeptionIfEmpty
}
