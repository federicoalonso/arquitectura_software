const jwt = require("jsonwebtoken");
const { validate } = require("./validate-users");
const {
  ElementAlreadyExist,
  ElementNotFoundException,
  WrongTokenFormatException,
  TokenExpiredException,
  TokenValidationError,
} = require("../../exceptions/exceptions");
const { messageBinder } = require("./locale/locale-binder");
const authMethods = require("../../auth-methods");
const { sendToLog } = require("../../services/logMiddleware");

var dbModels;

const setDbModels = function (models) {
  dbModels = models;
};

const create = async function (user) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().createUserCall,
    messageBinder().serviceName,
    user
  );
  validate(user);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userValidated,
    messageBinder().serviceName,
    user
  );
  if (user) {
    let userExists = await dbModels.User.findOne({
      where: {
        email: user.email,
      },
    });
    if (userExists) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().userExists,
        messageBinder().serviceName,
        userExists
      );
      throw new ElementAlreadyExist(messageBinder().alreadyExist);
    }
  }
  let newUser = await dbModels.User.create(user);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userCreated,
    messageBinder().serviceName,
    newUser
  );
  return newUser;
};

const getUser = async function (id) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userCreated,
    messageBinder().serviceName,
    id
  );
  let user = await dbModels.User.findByPk(id);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userFound,
    messageBinder().serviceName,
    user
  );
  return user;
};

const getAll = async function () {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getAllUsers,
    messageBinder().serviceName,
    {}
  );
  let users = await dbModels.User.findAll();
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().usersFound,
    messageBinder().serviceName,
    users
  );
  return users;
};

const getAdmins = async function () {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().getAllUsers,
    messageBinder().serviceName,
    {}
  );
  // find all admins users
  let users = await dbModels.User.findAll({
    where: {
      role_id: 1,
    },
  });
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().usersFound,
    messageBinder().serviceName,
    users
  );
  return users;
};

const remove = async function (id) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().remove,
    messageBinder().serviceName,
    id
  );
  let userToRemove = await dbModels.User.findByPk(id);
  if (!userToRemove) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().userNotFound,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userFound,
    messageBinder().serviceName,
    userToRemove
  );
  try {
    await dbModels.User.destroy({ where: { id: id } });
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorWhileRemovingUser,
      messageBinder().serviceName,
      id
    );
    console.log(
      "An error occurred while removing the user: " + JSON.stringify(err)
    );
    throw err;
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userRemoved,
    messageBinder().serviceName,
    userToRemove
  );
  return;
};

const update = async function (id, user) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().updateUser,
    messageBinder().serviceName,
    { userToUpdateId: id, userWithUpdates: user }
  );
  validate(user);
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userValidated,
    messageBinder().serviceName,
    user
  );
  let userToUpdate = await dbModels.User.findByPk(id);
  if (!userToUpdate) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().userNotFound,
      messageBinder().serviceName,
      id
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  try {
    await dbModels.User.update(user, { where: { id: id } });
  } catch (err) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorUpdatingUser,
      messageBinder().serviceName,
      err
    );
    console.log(
      "An error occurred while updating the user: " + JSON.stringify(err)
    );
    throw err;
  }
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().userUpdated,
    messageBinder().serviceName,
    user
  );
  return user;
};

const validateToken = async function (token) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().validateToken,
    messageBinder().serviceName,
    token
  );
  if (!token) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().tokenNotFound,
      messageBinder().serviceName,
      token
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }

  // Decodes the token without verifying
  const decoded = jwt.decode(token);

  // It's a good practice to handle the scenario where the decoded object is null or undefined.
  if (!decoded || !decoded.email) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().notAbleToDecodeOrUndefined,
      messageBinder().serviceName,
      {}
    );
    throw new WrongTokenFormatException(messageBinder().notFound);
  }

  // Fetch the user's auth method from the database
  const user = await dbModels.User.findOne({ where: { email: decoded.email } });

  if (!user || !authMethods[user.auth_method]) {
    sendToLog(
      messageBinder().levelError,
      messageBinder().userNotExistsOrNotDefinedAuthMeth,
      messageBinder().serviceName,
      { user: user, authMethods: authMethods[user.auth_method] }
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }

  const { decoded: userDecoded, error } = authMethods[user.auth_method](token);

  if (error) {
    if (error.name === "TokenExpiredError") {
      sendToLog(
        messageBinder().levelError,
        messageBinder().tokenExpiredError,
        messageBinder().serviceName,
        error
      );
      throw new TokenExpiredException(messageBinder().tokenExpired);
    }
    sendToLog(
      messageBinder().levelError,
      messageBinder().errorValidatingToken,
      messageBinder().serviceName,
      error
    );
    throw new TokenValidationError(messageBinder().tokenValidationError);
  }

  // get user role
  let role = await dbModels.Role.findByPk(user.role_id);

  userDecoded.role = role.name;

  sendToLog(
    messageBinder().levelInfo,
    messageBinder().rolTokenDecodificado,
    messageBinder().serviceName,
    userDecoded
  );

  return userDecoded;
};

const preload_users = async function () {
  const preloadUsers = require("./preload-users.json");

  for (let i = 0; i < preloadUsers.users.length; i++) {
    const element = preloadUsers.users[i];

    let userFound = await dbModels.User.findOne({
      where: { email: element.email },
    });
    if (userFound) {
      return;
    }
    await dbModels.User.create(element);
  }
};

module.exports = {
  create,
  getUser,
  getAll,
  update,
  remove,
  validateToken,
  getAdmins,
  preload_users,
  setDbModels,
};
