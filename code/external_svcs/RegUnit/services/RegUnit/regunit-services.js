const authProviders = require('./auth-providers.json');

async function isAuthorizedProvider(email) {
  const list = authProviders.authProviders;
  for (let i = 0; i < list.length; i++) {
    let email_l = list[i].email.toLowerCase();
    if (list[i].email === email) {
      return true
    }
  }
  return false
}

module.exports = {
  isAuthorizedProvider
}
