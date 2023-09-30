const crudMessages = {
  eventIsMissing: "El evento es obligatorio",
  nombreIsMissing: "El nombre es obligatorio",
  descripcionIsMissing: "La descripción es obligatoria",
  f_inicioIsMissing: "La fecha de inicio es obligatoria",
  f_finIsMissing: "La fecha de fin es obligatoria",
  f_inicioIsGreaterThan_f_fin:
    "La fecha de inicio debe ser menor a la fecha de fin",
  imagen_min_urlIsMissing: "La imagen miniatura es obligatoria",
  imagen_prin_urlIsMissing: "La imagen principal es obligatoria",
  video_urlIsMissing: "El video es obligatorio",
  video_sizeIsMissing: "El tamaño del video es obligatorio",
  categoriaIsMissing: "La categoría es obligatoria",
  evento_urlIsMissing: "La url del evento es obligatoria",
  f_finShouldBeGreaterThanToday: "La fecha de fin debe ser mayor a hoy",
  f_inicioShouldBeGreaterThanToday: "La fecha de inicio debe ser mayor a hoy",
  cantUpdateIfAuth: "El evento no puede ser actualizado si está autorizado",
};

module.exports = {
  crudMessages,
};
