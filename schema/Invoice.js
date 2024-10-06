const mongoose = require("mongoose");

const invoice = new mongoose.Schema({
  createdDate: {
    type: String,
    required: true,
  },
  invoiceRef: {
    type: String,
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  patientNic: {
    type: String,
    required: true,
  },
  patientFirstname: {
    type: String,
    required: true,
  },
  patientLastname: {
    type: String,
    required: true,
  },
  lab: {
    type: String,
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    required: true,
  },
});

const invoiceSchema = mongoose.model("Invoice", invoice);

module.exports = { Invoice: invoiceSchema };
