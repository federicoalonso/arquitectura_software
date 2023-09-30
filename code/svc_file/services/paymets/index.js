const CustomPaymentService = require("./custom_service");

class PaymentServiceFactory {
  static create(type) {
    switch (type) {
      case "CustomPaymentService":
        return new CustomPaymentService();
      default:
        throw new Error(`No se reconoce el tipo de servicio de pago: ${type}`);
    }
  }
}

module.exports = PaymentServiceFactory;
