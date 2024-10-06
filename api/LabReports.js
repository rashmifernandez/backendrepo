const { v4: uuidv4 } = require("uuid");
const { create } = require("ipfs-http-client");

//schema
const { Patient } = require("../schema/Patient");
const { Invoice } = require("../schema/Invoice");

//validation
const {
  UploadCBPValidation,
  UploadCBPUrineValidation,
  UploadLFRValidation,
  GetValidation,
} = require("../validation/Validate");

const { addLabReport } = require("../util/blockchain");
const { encrypt } = require("../util/encryption");

//conf
const auth =
  "Basic " +
  Buffer.from(
    "2FZein9vQv941wpxvlCyCKWDKMB" + ":" + "12e3f8c34278dca1a7d12d14f7b0691d"
  ).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const options = {
  warpWithDirectory: true,
  progress: (prog) => console.log(`Saved : ${prog}`),
};

exports.UploadCBP = async (req, res) => {
  try {
    const validated = await UploadCBPValidation.validateAsync(req.body.data);

    //check if used
    const checkUsed = await Invoice.findOne({
      invoiceRef: validated.invoiceRef,
    });

    if (!checkUsed) {
      return res.status(404).json({
        status: "404",
        message: "Invoice Not Found",
      });
    }

    if (checkUsed.used) {
      return res.status(400).json({
        status: "400",
        message: "Invoice Already Used",
      });
    }

    let data = {
      nic: validated.nic,
      gender: validated.gender,
      fullname: validated.fullname,
      dob: validated.dob,
      doctor: validated.doctor,
      hospital: validated.hospital,
      invoiceRef: validated.invoiceRef,
      collectedOn: validated.collectedOn,
      reportedOn: Date.now(),
      HEMOGLOBIN: validated.HEMOGLOBIN,
      PCV: validated.PCV,
      TRBC: validated.TRBC,
      platelet: validated.platelet,
      TWBC: validated.TWBC,
      NEUTROPHILS: validated.NEUTROPHILS,
      LYMPHOCYTES: validated.LYMPHOCYTES,
      EOSINOPHILS: validated.EOSINOPHILS,
      MONOCYTES: validated.MONOCYTES,
      BASOPHILS: validated.BASOPHILS,
      RBCMORPHOLOGY: validated.RBCMORPHOLOGY,
      WBC: validated.WBC,
      PLATEKETS: validated.PLATEKETS,
    };

    const patient = await Patient.findOne({ nic: validated.nic });

    let encryptedData = encrypt(JSON.stringify(data));

    // let filename = `${validated.invoiceRef}-${uuidv4().split("-")[0]}.json`;
    let filename = `${validated.invoiceRef}.json`;
    console.log(filename);
    const result = await client.add(
      {
        path: filename,
        content: encryptedData,
      },
      options
    );

    // creating transation
    const tx = await addLabReport(
      validated.invoiceRef,
      result.cid,
      patient.medicareID
    );

    console.log("Transcation block No: " + tx.blockNumber);

    const update = await Invoice.findOneAndUpdate(
      { invoiceRef: validated.invoiceRef },
      { $set: { used: true } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message:
        "CBR Uploaded Successfully. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: null,
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

exports.UploadUrineRoutine = async (req, res) => {
  try {
    const validated = await UploadCBPUrineValidation.validateAsync(
      req.body.data
    );

    //check if used
    const checkUsed = await Invoice.findOne({
      invoiceRef: validated.invoiceRef,
    });

    if (!checkUsed) {
      return res.status(404).json({
        status: "404",
        message: "Invoice Not Found",
      });
    }

    if (checkUsed.used) {
      return res.status(400).json({
        status: "400",
        message: "Invoice Already Used",
      });
    }

    let data = {
      nic: validated.nic,
      gender: validated.gender,
      fullname: validated.fullname,
      dob: validated.dob,
      doctor: validated.doctor,
      hospital: validated.hospital,
      invoiceRef: validated.invoiceRef,
      collectedOn: validated.collectedOn,
      reportedOn: Date.now(),
      quantity: validated.quantity,
      colour: validated.colour,
      appearance: validated.appearance,
      specificGravity: validated.specificGravity,
      proteins: validated.proteins,
      glucose: validated.glucose,
      urineKetones: validated.urineKetones,
      reaction: validated.reaction,
      occultBlood: validated.occultBlood,
      bileSalts: validated.bileSalts,
      bilePigments: validated.bilePigments,
      urobilinogen: validated.urobilinogen,
      epithelialCells: validated.epithelialCells,
      pusCells: validated.pusCells,
      redBloodCells: validated.redBloodCells,
      casts: validated.casts,
      crystals: validated.crystals,
      amorphousMaterial: validated.amorphousMaterial,
      yeastCells: validated.yeastCells,
      bacteria: validated.bacteria,
      trichomonasVaginalis: validated.trichomonasVaginalis,
      speramatozoa: validated.speramatozoa,
    };

    const patient = await Patient.findOne({ nic: validated.nic });

    let encryptedData = encrypt(JSON.stringify(data));

    // let filename = `${validated.invoiceRef}-${uuidv4().split("-")[0]}.json`;
    let filename = `${validated.invoiceRef}.json`;
    console.log(filename);
    const result = await client.add(
      {
        path: filename,
        content: encryptedData,
      },
      options
    );

    // creating transation
    const tx = await addLabReport(
      validated.invoiceRef,
      result.cid,
      patient.medicareID
    );

    console.log("Transcation block No: " + tx.blockNumber);

    const update = await Invoice.findOneAndUpdate(
      { invoiceRef: validated.invoiceRef },
      { $set: { used: true } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message:
        "UrineRoutine Uploaded Successfully. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: null,
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

exports.UploadLFR = async (req, res) => {
  try {
    const validated = await UploadLFRValidation.validateAsync(req.body.data);

    //check if used
    const checkUsed = await Invoice.findOne({
      invoiceRef: validated.invoiceRef,
    });

    if (!checkUsed) {
      return res.status(404).json({
        status: "404",
        message: "Invoice Not Found",
      });
    }

    if (checkUsed.used) {
      return res.status(400).json({
        status: "400",
        message: "Invoice Already Used",
      });
    }

    let data = {
      nic: validated.nic,
      gender: validated.gender,
      fullname: validated.fullname,
      dob: validated.dob,
      doctor: validated.doctor,
      hospital: validated.hospital,
      invoiceRef: validated.invoiceRef,
      collectedOn: validated.collectedOn,
      reportedOn: Date.now(),
      biiirubinTotal: validated.biiirubinTotal,
      biiirubinDirect: validated.biiirubinDirect,
      biiirubinIndirect: validated.biiirubinIndirect,
      sgpt: validated.sgpt,
      sgot: validated.sgot,
      alkalinePhosphatase: validated.alkalinePhosphatase,
      totalProteins: validated.totalProteins,
      albumin: validated.albumin,
      globulin: validated.globulin,
      agRatio: validated.agRatio,
    };

    const patient = await Patient.findOne({ nic: validated.nic });

    let encryptedData = encrypt(JSON.stringify(data));

    console.log(encryptedData);

    // let filename = `${validated.invoiceRef}-${uuidv4().split("-")[0]}.json`;
    let filename = `${validated.invoiceRef}.json`;
    console.log(filename);
    const result = await client.add(
      {
        path: filename,
        content: encryptedData,
      },
      options
    );

    // creating transation
    const tx = await addLabReport(
      validated.invoiceRef,
      result.cid,
      patient.medicareID
    );

    console.log("Transcation block No: " + tx.blockNumber);

    await Invoice.findOneAndUpdate(
      { invoiceRef: validated.invoiceRef },
      { $set: { used: true } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message:
        "LFR Uploaded Successfully. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: null,
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

exports.SearchLabReports = async (req, res) => {
  try {
    const validated = await GetValidation.validateAsync(req.query);
    console.log(validated);

    //get data from blockchain

    // get from ipfs

    return res.status(201).json({
      status: "201",
      message: "Successfully",
      data: null,
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
