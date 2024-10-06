const mongoose = require("mongoose");

const admin = new mongoose.Schema({
  medicareID: {
    type: String,
    required: true,
  },
  title: {
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
  email: {
    type: String,
    required: true,
  },
  hospitalId: {
    type: String,
    required: false,
  },
  hospitalName: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  address1: {
    type: String,
    required: true,
  },
  address2: {
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
  password: {
    type: String,
    required: true,
  },
  wallet: {
    type: String,
    required: true,
  },
});

const adminSchema = mongoose.model("Admin", admin);

module.exports = { Admin: adminSchema };
