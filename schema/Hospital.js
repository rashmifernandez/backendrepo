const mongoose = require("mongoose");

const hospital = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
});

const hospitalSchema = mongoose.model("Hospital", hospital);

module.exports = { Hospital: hospitalSchema };
