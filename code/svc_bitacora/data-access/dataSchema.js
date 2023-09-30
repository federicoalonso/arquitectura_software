const mongoose = require("mongoose");

const BitacoraSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  producedOn: {
    type: Date,
    default: Date.now,
  },
  optional: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
});

module.exports = mongoose.model("Data", BitacoraSchema);
