const mongoose = require("mongoose");

const Auths = new mongoose.Schema({
  event_name: { type: String, default: null },
  provider_name: { type: String, default: null },
  auth_type: { type: String, default: null },
  auth_date: { type: Date, default: Date.now },
  auth_status: { type: String, default: null },
  auth_description: { type: String, default: null },
  auth_by: { type: String, default: null },
});

module.exports = mongoose.model("Auths", Auths);
