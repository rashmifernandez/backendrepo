const mongoose = require("mongoose");

const registerRequest = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
  },
  kycResult: {
    type: Object,
    required: true,
  },
  ocrResult: {
    type: Object,
    required: true,
  },
  createdDate: {
    type: String,
    required: true,
  },
});

const registerRequestSchema = mongoose.model(
  "RegisterRequest",
  registerRequest
);

module.exports = { RegisterRequest: registerRequestSchema };
