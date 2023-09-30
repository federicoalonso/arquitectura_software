const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const {
  dateInRangeValidate,
  dateValidate,
} = require("../../common/date-validate");
const {
  throwExeptionIfNotHasProperty,
} = require("../../common/object-validate");
const { messageBinder } = require("./locale/locale-binder");

const validate = (event) => {
  throwExeptionIfUndefined(event, messageBinder().eventIsMissing);

  throwExeptionIfNotHasProperty(
    event,
    "nombre",
    messageBinder().nombreIsMissing
  );
  throwExeptionIfEmptyString(event.nombre, messageBinder().nombreIsMissing);

  throwExeptionIfNotHasProperty(
    event,
    "descripcion",
    messageBinder().descripcionIsMissing
  );
  throwExeptionIfEmptyString(
    event.descripcion,
    messageBinder().descripcionIsMissing
  );

  throwExeptionIfNotHasProperty(
    event,
    "f_inicio",
    messageBinder().f_inicioIsMissing
  );
  dateValidate(event.f_inicio, messageBinder().f_inicioIsMissing);

  throwExeptionIfNotHasProperty(event, "f_fin", messageBinder().f_finIsMissing);
  dateValidate(event.f_fin, messageBinder().f_finIsMissing);

  let date_in_future = new Date();
  date_in_future.setDate(date_in_future.getDate() + 99999);

  let date_in_past = new Date();
  date_in_past.setDate(date_in_past.getDate() - 99999);

  dateInRangeValidate(
    event.f_inicio,
    date_in_future,
    event.f_fin,
    messageBinder().f_inicioIsGreaterThan_f_fin
  );
  dateInRangeValidate(
    new Date(),
    date_in_future,
    event.f_fin,
    messageBinder().f_finShouldBeGreaterThanToday
  );
  dateInRangeValidate(
    new Date(),
    date_in_future,
    event.f_inicio,
    messageBinder().f_inicioShouldBeGreaterThanToday
  );

  throwExeptionIfNotHasProperty(
    event,
    "categoria",
    messageBinder().categoriaIsMissing
  );
  throwExeptionIfEmptyString(
    event.categoria,
    messageBinder().categoriaIsMissing
  );
};

module.exports = {
  validate,
};
