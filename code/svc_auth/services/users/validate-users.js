const { toNumberOrExeption } = require("../../common/number-validate");
const { thrrowErrorIfNotValidEmail } = require("../../common/email-validate");
const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const {
  throwExeptionIfNotHasProperty,
} = require("../../common/object-validate");
const { messageBinder } = require("./locale/locale-binder");
const { sendToLog } = require("../../services/logMiddleware");

const validate = (user) => {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().validateUserCall,
    messageBinder().serviceName,
    user
  );
  throwExeptionIfUndefined(user, messageBinder().userIsMissing);
  throwExeptionIfNotHasProperty(user, "email", messageBinder().emailIsMissing);
  throwExeptionIfEmptyString(user.email, messageBinder().emailIsMissing);
  thrrowErrorIfNotValidEmail(user.email, messageBinder().invalidEmailFormat);
  throwExeptionIfNotHasProperty(
    user,
    "role_id",
    messageBinder().roleIdIsMissing
  );
  toNumberOrExeption(user.role_id, messageBinder().roleIdIsMissing);
  throwExeptionIfNotHasProperty(
    user,
    "auth_method",
    messageBinder().authMethodIsMissing
  );
};

module.exports = {
  validate,
};
