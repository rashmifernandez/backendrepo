const mongoose = require("mongoose");

const ehrRequest = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const ehrRequestSchema = mongoose.model("EhrRequest", ehrRequest);

module.exports = { EhrRequest: ehrRequestSchema };
