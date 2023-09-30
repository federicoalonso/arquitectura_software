const mongoose = require("mongoose");

const Log = new mongoose.Schema({
  level: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  service: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  timestamp: {
    type: Date,
    required: false,
  },
  producedOn: {
    type: Date,
    default: Date.now,
  },
  logBody: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

module.exports = mongoose.model("Data", Log);
