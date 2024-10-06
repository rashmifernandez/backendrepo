const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

//schema
const { Hospital } = require("../schema/Hospital");

const { CreateHospitalValidation } = require("../validation/Validate");

const { createHospital } = require("../util/blockchain");

//validation
exports.CreateHospital = async (req, res) => {
  try {
    const validated = await CreateHospitalValidation.validateAsync(
      req.body.data
    );

    const hosp = await Hospital.findOne({ hospitalId: validated.hospitalId });

    if (hosp) {
      return res.status(400).json({
        status: "400",
        message: "Hospital id already exists",
      });
    }

    // creating transation
    const tx = await createHospital(validated.hospitalId);

    console.log("Transcation block No: " + tx.blockNumber);

    const result = new Hospital({
      hospitalId: validated.hospitalId,
      hospitalName: validated.hospitalName,
    });

    await result.save();

    return res.status(201).json({
      status: "201",
      message:
        "Hospital created successfully. " +
        "Transcation block No: " +
        tx.blockNumber,
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
