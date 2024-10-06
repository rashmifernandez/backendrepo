const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

//schema
const { Patient } = require("../schema/Patient");
const { Invoice } = require("../schema/Invoice");

//validation

exports.SearchPatientForLabs = async (req, res) => {
  try {
    let id = req.query.id;

    //check user exists
    const patient = await Patient.findOne({ nic: id }, { password: 0 });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "INACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient does not active yet",
      });
    }

    return res.status(201).json({
      status: "201",
      message: "Patient Data Found Successfully",
      data: patient,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      status: "500",
      message: "Something went wrong, please try again later",
      data: null,
    });
  }
};

exports.SearchInvoiceForLabs = async (req, res) => {
  try {
    let id = req.query.id;
    let nic = req.query.nic;

    //check user exists
    const invoice = await Invoice.findOne({ invoiceRef: id, patientNic: nic });

    if (!invoice) {
      return res.status(404).json({
        status: "404",
        message: "Invoice not found",
      });
    }

    return res.status(201).json({
      status: "201",
      message: "Invoice Data Found Successfully",
      data: invoice,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      status: "500",
      message: "Something went wrong, please try again later",
      data: null,
    });
  }
};
