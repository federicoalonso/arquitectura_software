const axios = require("axios");
const { customPaymentURL } = require("../../../conf/config")();

class CustomPaymentService {
  async Check(data) {
    try {
      const providePay = await axios({
        method: "get",
        url: `${customPaymentURL}/status?email=${data.proveedor_email}&description=${data.description}`,
      });
      return providePay.data;
    } catch (error) {
      console.log(error);
    }
  }

  async Pay(data) {
    try {
      const providePay = await axios({
        method: "post",
        url: `${customPaymentURL}`,
        data: data,
      });
      return providePay.data;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = CustomPaymentService;
