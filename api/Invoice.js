const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

//schema
const { Patient } = require("../schema/Patient");
const { Invoice } = require("../schema/Invoice");

//validation
const { CreateInvoiceValidation } = require("../validation/Validate");

//helpers

exports.CreateInvoice = async (req, res) => {
  try {
    const validated = await CreateInvoiceValidation.validateAsync(
      req.body.data
    );

    //check user exists
    const user = await Patient.findOne({ nic: validated.nic });
    // console.log(user);

    if (!user) {
      return res.status(404).json({
        status: "404",
        message: "Patient does not exists",
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient does not active yet",
      });
    }

    let lab = "";
    let payment = "";

    switch (validated.lab) {
      case "CBP":
        lab = "CBP-";
        payment = 1500;
        break;
      case "URINE ROUTINE":
        lab = "UR-";
        payment = 2000;
        break;
      case "LFR":
        lab = "LFR-";
        payment = 2500;
        break;
      default:
        return res.status(403).json({
          status: "403",
          message: "Invalid Lab Type",
        });
    }

    let invoiceRef = lab.concat(uuidv4().split("-")[0]);

    console.log(invoiceRef);

    const data = new Invoice({
      createdDate: Date.now(),
      invoiceRef: invoiceRef,
      patientNic: user.nic,
      patientFirstname: user.firstname,
      patientLastname: user.lastname,
      lab: validated.lab,
      doctor: validated.doctor,
      hospital: validated.hospital,
      payment: payment,
      used: false,
    });

    const result = await data.save();

    return res.status(201).json({
      status: "201",
      message: `Invoice created successfully - ${invoiceRef}`,
      data: result,
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

exports.GetInvoices = async (req, res) => {
  try {
    //check user exists
    const invoices = await Invoice.find({});

    if (invoices.length === 0) {
      return res.status(404).json({
        status: "404",
        message: "Invoices not found",
      });
    }

    return res.status(201).json({
      status: "201",
      message: "Successfully",
      data: invoices,
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

exports.GetInvoice = async (req, res) => {
  try {
    let id = req.query.id;
    console.log(id);

    //check user exists
    const invoice = await Invoice.findOne({ invoiceRef: id });

    if (!invoice) {
      return res.status(404).json({
        status: "404",
        message: "Invoice not found",
      });
    }

    return res.status(201).json({
      status: "201",
      message: "Invoice created successfully",
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
