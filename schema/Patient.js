const mongoose = require("mongoose");

const patient = new mongoose.Schema({
  createdDate: {
    type: String,
    required: true,
  },
  medicareID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  guardianName: {
    type: String,
    required: true,
  },
  guardianNic: {
    type: String,
    required: true,
  },
  guardianAddress: {
    type: String,
    required: true,
  },
  guardianRelationship: {
    type: String,
    required: true,
  },
  guardianNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  landphone: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  wallet: {
    type: String,
    required: true,
  },
  hospitalId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: false,
    default: "",
  },
  passwordReset: {
    type: String,
    required: false,
    default: "FALSE",
  },
  otpSent: {
    type: Number,
    required: false,
    default: 0,
  },
  token: {
    type: String,
    required: false,
    default: "",
  },
  tokenSent: {
    type: Number,
    required: false,
    default: 0,
  },
  selfieKey: {
    type: String,
    required: false,
    default: "",
  },
  idFrontKey: {
    type: String,
    required: false,
    default: "",
  },
  idBackKey: {
    type: String,
    required: false,
    default: "",
  },
  kycStarted: {
    type: String,
    required: false,
    default: "",
  },
  passwordToken: {
    type: String,
    required: false,
    default: "",
  },

  passwordTokenSent: {
    type: String,
    required: false,
    default: "",
  },
});

const patientSchema = mongoose.model("Patient", patient);

module.exports = { Patient: patientSchema };
