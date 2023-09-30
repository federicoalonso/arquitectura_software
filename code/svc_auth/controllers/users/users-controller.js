const {
  HttpErrorCodes,
  evalException,
} = require("../../exceptions/exceptions");
const { sendToLog } = require("../../services/logMiddleware");
const { messageBinder } = require("../../services/users/locale/locale-binder");

const { webServer } = require("../../conf/config")();

var usersLogic;

const startUsersRoutes = async function startUsersRoutes(router, logic) {
  sendToLog(
    messageBinder().levelInfo,
    messageBinder().startUsersRoutes,
    messageBinder().serviceName,
    { router: router, logic: logic }
  );
  usersLogic = logic;

  router.get(webServer.routes.users.getUsers, async function (req, res) {
    try {
      let users = await usersLogic.getAll();
      return res.status(HttpErrorCodes.HTTP_200_OK).send(users);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().startUsersRoutesError,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.get(webServer.routes.users.getAdminsUsers, async function (req, res) {
    try {
      let users = await usersLogic.getAdmins();
      return res.status(HttpErrorCodes.HTTP_200_OK).send(users);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().startUsersRoutesError,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.get(webServer.routes.users.getUser, async function (req, res) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().getRequest,
        messageBinder().serviceName,
        req
      );
      let id = req.params.id;

      let parseid = parseInt(id);
      let user = await usersLogic.getUser(parseid);
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().getResponse,
        messageBinder().serviceName,
        user
      );
      return res.status(HttpErrorCodes.HTTP_200_OK).send(user);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorGet,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.post(webServer.routes.users.createUser, async function (req, res) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().postRequest,
        messageBinder().serviceName,
        req
      );
      let aUser = req.body;
      let newUser = await usersLogic.create(aUser);
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().postResponse,
        messageBinder().serviceName,
        newUser
      );
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newUser);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorPost,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.put(webServer.routes.users.updateUser, async function (req, res) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().putRequest,
        messageBinder().serviceName,
        req
      );
      let id = req.params.id;
      let parseid = parseInt(id);
      let aUser = req.body;
      aUser.id = parseid;
      let userUpdate = await usersLogic.update(parseid, aUser);
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().putResponse,
        messageBinder().serviceName,
        userUpdate
      );
      return res.status(HttpErrorCodes.HTTP_200_OK).send(userUpdate);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorPut,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.delete(webServer.routes.users.deleteUser, async function (req, res) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().deleteRequest,
        messageBinder().serviceName,
        req
      );
      let id = req.params.id;
      await usersLogic.remove(id);

      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorDelete,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });

  router.post(webServer.routes.users.validateToken, async function (req, res) {
    const token = req.body.token;
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().postRequestToken,
        messageBinder().serviceName,
        req
      );
      let tokenValid = await usersLogic.validateToken(token);

      return res.status(HttpErrorCodes.HTTP_200_OK).send(tokenValid);
    } catch (err) {
      sendToLog(
        messageBinder().levelError,
        messageBinder().errorPostToken,
        messageBinder().serviceName,
        err
      );
      return evalException(err, res);
    }
  });
};

module.exports = {
  startUsersRoutes,
};
