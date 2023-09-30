const {
  ProviderNotAuthorizedException
} = require('../../../exceptions/exceptions')
const { messageBinder } = require('../locale/locale-binder')
function generateRandomBoolean() {
  const randomNumber = Math.random()
  const authorized = randomNumber > 0.5
  return authorized
}

async function authorizeVerification() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isAuthorized = generateRandomBoolean()

      if (isAuthorized) {
        // Authorized logic goes here
        resolve(true)
      } else {
        // Unauthorized logic goes here
        reject(
          new ProviderNotAuthorizedException(
            messageBinder().ProviderNotAuthorized
          )
        )
      }
    }, 1000)
  })
}

module.exports = authorizeVerification
