const axios = require("axios");
const { customPaymentURL } = require("../../../conf/config")();
const { sendToLog } = require("../../../services/logMiddleware");
const { messageBinder } = require("../../events/locale/locale-binder");

class CustomPaymentService {
  async Check(data) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().checkPaymentDataCall,
        messageBinder().serviceName,
        data
      );

      const providePay = await axios({
        method: "get",
        url: `${customPaymentURL}/status?email=${data.proveedor_email}&description=${data.description}`,
      });
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().providePayVerified,
        messageBinder().serviceName,
        providePay
      );
      return providePay.data;
    } catch (error) {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().paymentVerificationError,
        messageBinder().serviceName,
        error
      );
      console.log(error);
    }
  }

  async Pay(data) {
    try {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().PayCall,
        messageBinder().serviceName,
        data
      );
      const providePay = await axios({
        method: "post",
        url: `${customPaymentURL}`,
        data: data,
      });
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().providePayVerified,
        messageBinder().serviceName,
        providePay
      );
      return providePay.data;
    } catch (error) {
      sendToLog(
        messageBinder().levelInfo,
        messageBinder().ErrorPaying,
        messageBinder().serviceName,
        error
      );
      console.log(error);
    }
  }
}

module.exports = CustomPaymentService;
