const mongoose = require("mongoose");

const qr = new mongoose.Schema({
  invoiceRef: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  medicareID: {
    type: String,
    required: true,
  },
});

const qrSchema = mongoose.model("QR", qr);

module.exports = {
  QR: qrSchema,
};
