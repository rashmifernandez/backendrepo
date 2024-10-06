const axios = require("axios");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { create } = require("ipfs-http-client");

//schema
const { Patient } = require("../schema/Patient");
const { EhrRequest } = require("../schema/EhrRequest");

//validation
const {
  EHRValidation,
  GetValidation,
  NewEHRValidation,
  NormalEhrRequestValidation,
  SubmitEHRResponseValidation,
} = require("../validation/Validate");

const { addMedicalReport, getMedicalReport } = require("../util/blockchain");
const { encrypt, decrypt } = require("../util/encryption");

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

let options = {
  warpWithDirectory: true,
  progress: (prog) => console.log(`Saved : ${prog}`),
};

exports.CreateEHR = async (req, res) => {
  try {
    const validated = await EHRValidation.validateAsync(req.body.data);

    const pdata = await Patient.findOne({ nic: validated.nic });

    if (!pdata) {
      return res.status(404).json({
        status: "404",
        message: "Patient Not Found",
      });
    }

    let medId = pdata.medicareID;
    let criticaEhrId = `EHR-CRI-${medId}-`.concat(uuidv4().split("-")[0]);
    let normalEhrId = `EHR-NOR-${medId}-`.concat(uuidv4().split("-")[0]);

    const criticalData = {
      ehrId: criticaEhrId,
      nic: validated.nic,
      fullname: validated.fullname,
      doctor: validated.doctor,
      allergies: validated.allergies,
      blood: validated.blood,
      lastDate: validated.lastDate,
      illnesses: validated.illnesses,
      hypertension: validated.hypertension,
      heartDisease: validated.heartDisease,
      everMarried: validated.everMarried,
      workType: validated.workType,
      ResidenceType: validated.ResidenceType,
      avgGlucoseLevel: validated.avgGlucoseLevel,
      bmi: validated.bmi,
      smokingStatus: validated.smokingStatus,
      weight: validated.weight,
      metformin: validated.metformin,
      insulin: validated.insulin,
      miglitol: validated.miglitol,
      geneticRisk: validated.geneticRisk,
      chestPain: validated.chestPain,
      lungRealatedComplexities: validated.lungRealatedComplexities,
      shortnessOfBreath: validated.shortnessOfBreath,
      snoring: validated.snoring,
      smokingHabits: validated.smokingHabits,
      createdDate: Date.now(),
      type: "CRITICAL",
    };

    const data = {
      ehrId: normalEhrId,
      nic: validated.nic,
      fullname: validated.fullname,
      doctor: validated.doctor,
      allergies: validated.allergies,
      blood: validated.blood,
      lastDate: validated.lastDate,
      illnesses: validated.illnesses,
      weight: validated.weight,
      metformin: validated.metformin,
      insulin: validated.insulin,
      miglitol: validated.miglitol,
      createdDate: Date.now(),
      type: "NORMAL",
    };

    const resultForNonCritical = await client.add(
      {
        path: `${normalEhrId}.json`,
        content: encrypt(JSON.stringify(data)),
      },
      options
    );

    const resultForCritical = await client.add(
      {
        path: `${criticaEhrId}.json`,
        content: encrypt(JSON.stringify(criticalData)),
      },
      options
    );

    // creating transation for non-critical
    const txNonCritical = await addMedicalReport(
      normalEhrId,
      false,
      resultForNonCritical.cid,
      pdata.medicareID
    );

    // creating transation for critical
    const txCritical = await addMedicalReport(
      criticaEhrId,
      true,
      resultForCritical.cid,
      pdata.medicareID
    );

    console.log(
      "Transcation block No: " + txNonCritical.blockNumber,
      txCritical.blockNumber
    );

    return res.status(201).json({
      status: "201",
      message:
        "EHR Created Successfully. " +
        "Transcation block No (critical): " +
        txCritical.blockNumber +
        " Transcation block No (non-critical): " +
        txNonCritical.blockNumber,
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

exports.CreateNewEHR = async (req, res) => {
  try {
    const validated = await NewEHRValidation.validateAsync(req.body.data);

    const pdata = await Patient.findOne({ nic: validated.nic });

    if (!pdata) {
      return res.status(404).json({
        status: "404",
        message: "Patient Not Found",
      });
    }

    let medId = pdata.medicareID;
    let ehrId = `EHR-New-${medId}-`.concat(uuidv4().split("-")[0]);

    const data = {
      ehrId: ehrId,
      nic: validated.nic,
      fullname: validated.fullname,
      doctor: validated.doctor,
      date: validated.date,
      title: validated.title,
      description: validated.description,
      medication: validated.medication,
      injuries: validated.injuries,
      createdDate: Date.now(),
      status: "PENDING",
    };

    let filename = `${ehrId}.json`;
    console.log(filename);

    const result = await client.add(
      {
        path: filename,
        content: encrypt(JSON.stringify(data)),
      },
      options
    );

    const tx = await addMedicalReport(
      ehrId,
      true,
      result.cid,
      pdata.medicareID
    );

    console.log("Transcation block No: " + tx.blockNumber);

    return res.status(201).json({
      status: "201",
      message:
        "EHR Created Successfully. " +
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

exports.GetEHRs = async (req, res) => {
  try {
    const result = await EhrRequest.find();

    return res.status(201).json({
      status: "201",
      message: "EHR Retrieved Successfully",
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

exports.GetEHR = async (req, res) => {
  try {
    const validated = await GetValidation.validateAsync(req.query);

    const result = await EhrRequest.findOne({ id: validated.id });

    if (!result) {
      return res.status(404).json({
        status: "404",
        message: "EHR Not Found",
      });
    }

    if (result.status !== "APPROVED") {
      return res.status(400).json({
        status: "400",
        message: "EHR Not Approved yet",
      });
    }

    const patient = await Patient.findOne({ nic: result.nic });
    console.log(patient.medicareID);

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient Not Found",
      });
    }

    const tx = await getMedicalReport(patient.medicareID);

    console.log(tx);

    if (tx === 0) {
      return res.status(404).json({
        status: "404",
        message: "EHR Data not found",
      });
    }

    let dataToSend = [];

    for (let index = 0; index < tx[0].length; index++) {
      const asyncitr = client.cat(tx[0][index]);

      for await (const itr of asyncitr) {
        let data = JSON.parse(decrypt(Buffer.from(itr).toString()));

        console.log(data);

        if (tx[1][index]) {
          data.type = "CRITICAL";
        }

        if (!tx[1][index]) {
          data.type = "NORMAL";
        }

        if (data.type === result.type) {
          dataToSend.push(data);
        }
      }
    }

    return res.status(201).json({
      status: "201",
      message: "EHR Found Successfully",
      data: dataToSend,
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

exports.GetEHRList = async (req, res) => {
  try {
    let token = req.token;

    const getPatient = await Patient.findOne({ medicareID: token.medicareID });

    if (!getPatient) {
      return res.status(404).json({
        status: "404",
        message: "Patient Not Found",
      });
    }

    const result = await EhrRequest.find({ nic: getPatient.nic });

    return res.status(201).json({
      status: "201",
      message: "EHRs Found Successfully",
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

exports.SubmitEHRResponse = async (req, res) => {
  try {
    const validated = await SubmitEHRResponseValidation.validateAsync(
      req.body.data
    );

    console.log(validated);

    const result = await EhrRequest.findOne({ id: validated.id });

    if (!result) {
      return res.status(404).json({
        status: "404",
        message: "EHR Not Found",
        data: result,
      });
    }

    const update = await EhrRequest.findOneAndUpdate(
      { id: validated.id },
      { $set: { status: validated.res } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message: "EHR Approved Successfully",
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

exports.NormalEhrRequest = async (req, res) => {
  try {
    const validated = await NormalEhrRequestValidation.validateAsync(
      req.body.data
    );

    const patient = await Patient.findOne({ nic: validated.nic });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "INACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient not activated",
      });
    }

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Dr. Amila Deshapriya is requesting to access your general electronic health records. Please approve the request after logging into the patient account`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    const request = new EhrRequest({
      id: uuidv4(),
      nic: validated.nic,
      doctor: "Amila Deshapriya",
      type: "NORMAL",
      status: "PENDING",
      date: moment(Date.now()).format("YYYY-MM-DD"),
    });

    await request.save();

    return res.status(201).json({
      status: "201",
      message: "EHR request sent successfully",
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

exports.CriticalEhrRequest = async (req, res) => {
  try {
    const validated = await NormalEhrRequestValidation.validateAsync(
      req.body.data
    );

    const patient = await Patient.findOne({ nic: validated.nic });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "INACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient not activated",
      });
    }

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Dr. Amila Deshapriya is requesting to access your critical electronic health records. Please approve the request after logging into the patient account`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    const request = new EhrRequest({
      id: uuidv4(),
      nic: validated.nic,
      doctor: "Amila Deshapriya",
      type: "CRITICAL",
      status: "PENDING",
      date: moment(Date.now()).format("YYYY-MM-DD"),
    });

    await request.save();

    return res.status(201).json({
      status: "201",
      message: "EHR request sent successfully",
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
