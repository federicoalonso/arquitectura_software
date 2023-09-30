const axios = require("axios");
const { regulatoryUnitURL } = require("../conf/config")();
const PaymentServiceFactory = require("../services/paymets");

const check_dates = async (input, next) => {
  let today = new Date();
  let f_inicio = new Date(input.f_inicio);
  let f_fin = new Date(input.f_fin);
  if (f_inicio >= today && f_fin >= f_inicio) {
    input.autorizado = true && input.autorizado;
  } else {
    input.autorizado = false;
    input.auth_description = "Las fechas no son validas";
    next(new Error("Las fechas no son validas"), input);
  }
  next(null, input);
};

const regulatory_check = async (input, next) => {
  const providerAuthorized = await axios({
    method: "get",
    url: `${regulatoryUnitURL}?email=${input.proveedor_email}`,
  });
  // returns true if the provider is authorized
  console.log(providerAuthorized.data);
  if (providerAuthorized.data) {
    input.autorizado = true && input.autorizado;
  } else {
    input.autorizado = false;
    input.auth_description = "El proveedor no esta autorizado";
    next(new Error("El proveedor no esta autorizado"), input);
  }
  next(null, input);
};

const payment_check = async (input, next) => {
  try {
    const paymentService = PaymentServiceFactory.create("CustomPaymentService");
    const providePay = await paymentService.Check(input);
    if (providePay) {
      input.autorizado = true && input.autorizado;
    } else {
      next(new Error("El proveedor no realizó el pago"), input);
    }
    next(null, input);
  } catch (error) {
    input.autorizado = false;
    input.auth_description = "El proveedor no realizó el pago";
    next(new Error("El proveedor no realizó el pago"), input);
  }
};

module.exports = {
  check_dates,
  regulatory_check,
  payment_check,
};
