const crudMessages = {
  eventIsMissing: "The event is required",
  nombreIsMissing: "The name is required",
  descripcionIsMissing: "The description is required",
  f_inicioIsMissing: "The start date is required",
  f_finIsMissing: "The end date is required",
  f_inicioIsGreaterThan_f_fin: "The start date must be less than the end date",
  imagen_min_urlIsMissing: "The thumbnail image is required",
  imagen_prin_urlIsMissing: "The main image is required",
  video_urlIsMissing: "The video is required",
  video_sizeIsMissing: "The video size is required",
  categoriaIsMissing: "The category is required",
  evento_urlIsMissing: "The event url is required",
  f_finShouldBeGreaterThanToday: "The end date must be greater than today",
  f_inicioShouldBeGreaterThanToday: "The start date must be greater than today",
  cantUpdateIfAuth: "The event cannot be updated if it is authorized",
};

module.exports = {
  crudMessages,
};
