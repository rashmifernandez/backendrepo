const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const {
  uploadFileWithRotate,
  uploadFileWithoutRotate,
  getFileStream,
  getFileStream1,
} = require("../util/s3");
const { checkKYC } = require("../util/rekognition");
const bcrypt = require("bcrypt");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const Jimp = require("jimp");
const Tesseract = require("tesseract.js");
const { create } = require("ipfs-http-client");

//schema
const { Patient } = require("../schema/Patient");
const { RegisterRequest } = require("../schema/RegisterRequest");

//block
const { storeUser } = require("../util/blockchain");

//validation
const {
  PatientValidationNIC,
  PatientValidationOTP,
  PatientValidationLogin,
  GetValidation,
  PasswordResetValidation,
} = require("../validation/Validate");

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

function generateAccessTokenForPatient(
  medicareID,
  role,
  profile,
  firstname,
  lastname
) {
  // expires in 24h
  let user = {
    admin: false,
    authenticated: true,
    medicareID: medicareID,
    role: role,
    profile: profile,
    fullname: firstname + " " + lastname,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  return jwt.sign(user, "AKIAURO2OFILH25ELFJR", {
    algorithm: "HS512",
    issuer: "Neuromed",
  });
}

async function rotate(input, output) {
  // Reading Image
  const image = await Jimp.read(input);
  // Checking if any error occurs while rotating image
  image
    .rotate(90, function (err) {
      if (err) throw err;
    })
    .write(output);
}

exports.PatientActivationNIC = async (req, res) => {
  try {
    const validated = await PatientValidationNIC.validateAsync(req.body.data);

    //check user exists
    const patient = await Patient.findOne(
      { nic: validated.nic },
      { password: 0 }
    );

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "ACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient already activated",
      });
    }

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);
    let otp = Math.floor(100000 + Math.random() * 900000);
    let otpSent = moment().unix();

    let message = `Your One Time Password for Medicare Patient Activation is ${otp}`;

    const result = await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    const update = await Patient.findOneAndUpdate(
      { nic: validated.nic },
      { $set: { otp: otp, otpSent: otpSent } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message: "OTP Sent Successfully",
      data: patient.nic,
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

exports.PatientActivationOTP = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await PatientValidationOTP.validateAsync(req.body.data);

    //check user exists
    const patient = await Patient.findOne(
      { nic: validated.nic },
      { password: 0 }
    );

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "ACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient already activated",
      });
    }

    if (patient.otp !== validated.otp) {
      return res.status(403).json({
        status: "403",
        message: "Invalid OTP",
      });
    }

    let otpSent = patient.otpSent;
    let expireTime = moment().unix();
    let diff = expireTime - otpSent;

    console.log(otpSent, expireTime, expireTime - otpSent);

    if (diff > 300) {
      return res.status(404).json({
        status: "404",
        message: "OTP Expired",
      });
    }

    let token = uuidv4();
    let tokenSent = moment().unix();

    const update = await Patient.findOneAndUpdate(
      { nic: validated.nic },
      { $set: { token: token, tokenSent: tokenSent } },
      {
        new: true,
      }
    );

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Please visit the following URL to proceed with the KYC verification https://health.neuromed.shop/kyc-verification/${token}`;

    const result = await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    return res.status(201).json({
      status: "201",
      message: `OTP confirmed successfully. Please visit the following url https://health.neuromed.shop/kyc-verification/${token} or proceed with the mobile phone.`,
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

exports.PatientActivationFrontImage = async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body.token);

    //check user exists
    const patient = await Patient.findOne({ token: req.body.token });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    // checkTokenExpiry;
    let tokenSent = patient.tokenSent;
    let expireTime = moment().unix();
    let diff = expireTime - tokenSent;

    if (diff > 6000) {
      return res.status(404).json({
        status: "404",
        message:
          "Token Expired, Please start the KYC verification from beginning",
      });
    }

    const file = req.file;

    const result = await uploadFileWithoutRotate(file);
    console.log(result, "result");

    const update = await Patient.findOneAndUpdate(
      { nic: patient.nic },
      { $set: { selfieKey: result.Key } },
      {
        new: true,
      }
    );

    //deleting from the file system after upload is completed
    await unlinkFile(file.path);

    return res.status(201).json({
      status: "201",
      message: "success",
      data: "File uploaded successfully",
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

exports.PatientActivationIdFront = async (req, res) => {
  try {
    // console.log(req.file);
    // console.log(req.body.token);

    //check user exists
    const patient = await Patient.findOne({ token: req.body.token });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    // checkTokenExpiry;
    let tokenSent = patient.tokenSent;
    let expireTime = moment().unix();
    let diff = expireTime - tokenSent;

    if (diff > 6000) {
      return res.status(404).json({
        status: "404",
        message:
          "Token Expired, Please start the KYC verification from beginning",
      });
    }

    const file = req.file;

    let rotatedName = uuidv4();
    let ext = req.file.filename.split(".")[1];
    rotatedName = rotatedName.concat(`.${ext}`);

    const result = await uploadFileWithRotate(req.file, rotatedName);
    console.log(result, "result");

    const update = await Patient.findOneAndUpdate(
      { nic: patient.nic },
      { $set: { idFrontKey: result.Key } },
      {
        new: true,
      }
    );

    //deleting from the file system after upload is completed
    await unlinkFile(file.path);
    await unlinkFile(`./uploads/${rotatedName}`);

    return res.status(201).json({
      status: "201",
      message: "success",
      data: "File uploaded successfully",
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

exports.PatientActivationIdFBack = async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body.token);

    //check user exists
    const patient = await Patient.findOne({ token: req.body.token });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    // checkTokenExpiry;
    let tokenSent = patient.tokenSent;
    let expireTime = moment().unix();
    let diff = expireTime - tokenSent;

    if (diff > 6000) {
      return res.status(404).json({
        status: "404",
        message:
          "Token Expired, Please start the KYC verification from beginning",
      });
    }

    const file = req.file;

    let rotatedName = uuidv4();
    let ext = req.file.filename.split(".")[1];
    rotatedName = rotatedName.concat(`.${ext}`);

    const result0 = await uploadFileWithRotate(req.file, rotatedName);
    console.log(result0, "result");

    const update = await Patient.findOneAndUpdate(
      { nic: patient.nic },
      { $set: { idBackKey: result0.Key } },
      {
        new: true,
      }
    );

    // deleting from the file system after upload is completed
    await unlinkFile(file.path);
    await unlinkFile(`./uploads/${rotatedName}`);

    const imageData = await Patient.findOne({ nic: patient.nic });
    console.log(imageData);

    const selfiekey = imageData.selfieKey;
    const selfiereadStream = getFileStream(selfiekey);
    selfiereadStream.pipe(fs.createWriteStream(`./uploads/${selfiekey}`));

    const idFrontkey = imageData.idFrontKey;
    const idFrontreadStream = getFileStream(idFrontkey);
    idFrontreadStream.pipe(fs.createWriteStream(`./uploads/${idFrontkey}`));

    const idBackkey = imageData.idBackKey;
    const idBackreadStream = getFileStream(idBackkey);
    idBackreadStream.pipe(fs.createWriteStream(`./uploads/${idBackkey}`));

    await new Promise((r) => setTimeout(r, 2000));

    console.log("created");

    //get files to process
    let idNumber = "./uploads/ID_Number.jpg";
    let idName = "./uploads/ID_Name.jpg";
    let profilePhoto = "./uploads/ID_Face.jpg";
    let Address = "./uploads/ID_Address.jpg";

    let selfieImage = `./uploads/${selfiekey}`;
    // let frontImage = `./uploads/${idFrontkey}`;
    // let backImage = `./uploads/${idBackkey}`;
    let frontImage = `./uploads/front.png`;
    let backImage = `./uploads/back.png`;

    await sharp(frontImage)
      .extract({ width: 180, height: 26, left: 250, top: 58 })
      .toFile(idNumber);
    console.log("Image idNumber cropped");

    await sharp(frontImage)
      .extract({ width: 300, height: 50, left: 220, top: 165 })
      .toFile(idName);
    console.log("Image idName cropped");

    await sharp(frontImage)
      .extract({ width: 140, height: 180, left: 45, top: 75 })
      .toFile(profilePhoto);
    console.log("Image profilePhoto cropped");

    await sharp(backImage)
      .extract({ width: 300, height: 30, left: 35, top: 72 })
      .toFile(Address);
    console.log("Image Address cropped");

    const result = await Tesseract.recognize("./uploads/ID_Number.jpg", "eng", {
      logger: (m) => null,
    });
    console.log(result.data.text.trim());

    const result1 = await Tesseract.recognize("./uploads/ID_Name.jpg", "eng", {
      logger: (m) => null,
    });
    console.log(result1.data.text.trim());

    const result2 = await Tesseract.recognize(
      "./uploads/ID_Address.jpg",
      "eng",
      {
        logger: (m) => null,
      }
    );
    console.log(result2.data.text.trim());

    // kyc verification
    // const KycResult = checkKYC(patient.selfieKey, patient.idFrontKey);
    const KycResult = await checkKYC(selfieImage, "ID_Face.jpg");

    if (KycResult === "Face Recognition Fail") {
      return res.status(500).json({
        status: "500",
        message: "KYC verfication failed, please try again",
        data: null,
      });
    }

    const newRequest = new RegisterRequest({
      requestId: uuidv4(),
      nic: patient.nic,
      kycResult: {
        status: "PASSED",
        result: KycResult,
      },
      ocrResult: {
        nic: patient.nic,
        fullname: patient.name,
        address: patient.address,
      },
      createdDate: moment().unix(),
    });

    await newRequest.save();

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Your KYC verification is in process. You will be notified once it is approved`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    await unlinkFile(idNumber);
    await unlinkFile(idName);
    await unlinkFile(profilePhoto);
    await unlinkFile(Address);
    await unlinkFile(`./uploads/${idFrontkey}`);
    await unlinkFile(`./uploads/${idBackkey}`);
    await unlinkFile(`./uploads/${selfiekey}`);

    return res.status(201).json({
      status: "201",
      message:
        "KYC verification is pending, once completed you will be notifed by us.",
      data: "KYC verification is pending, once completed you will be notifed by us.",
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

exports.PatientLogin = async (req, res) => {
  try {
    const validated = await PatientValidationLogin.validateAsync(req.body.data);

    //check user exists
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
        message: "Patient is not activated",
      });
    }
    console.log(patient.password, validated.password);

    //compare hash
    const verify = bcrypt.compareSync(validated.password, patient.password);
    console.log(verify);

    if (!verify) {
      return res.status(404).json({
        status: "404",
        message: "Invalid Password",
      });
    }

    let m = patient.mobile.substring(1);
    let mobile = "94".concat(m);
    let otp = Math.floor(100000 + Math.random() * 900000);
    let otpSent = moment().unix();

    let message = `Your One Time Password for NeuroMed Patient Login is ${otp}`;

    const result = await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    const update = await Patient.findOneAndUpdate(
      { nic: validated.nic },
      { $set: { otp: otp, otpSent: otpSent } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message: "OTP Sent Successfully",
      data: patient.nic,
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

exports.PatientLoginOTP = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await PatientValidationOTP.validateAsync(req.body.data);

    //check user exists
    const patient = await Patient.findOne(
      { nic: validated.nic },
      { password: 0 }
    );

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient not found",
      });
    }

    if (patient.status === "INACTIVE") {
      return res.status(404).json({
        status: "404",
        message: "Patient is not activated",
      });
    }

    if (patient.otp !== validated.otp) {
      return res.status(403).json({
        status: "403",
        message: "Invalid OTP",
      });
    }

    let otpSent = patient.otpSent;
    let expireTime = moment().unix();
    let diff = expireTime - otpSent;

    console.log(otpSent, expireTime, expireTime - otpSent);

    if (diff > 300) {
      return res.status(404).json({
        status: "404",
        message: "OTP Expired",
      });
    }

    //create jwt token
    let token = generateAccessTokenForPatient(
      patient.medicareID,
      "Patient",
      patient.profile,
      patient.firstname,
      patient.lastname
    );
    console.log(token);

    // set cookies
    res.cookie("jwtToken", token, {
      maxAge: new Date(new Date().valueOf() + 1000 * 3600 * 24), // 1 day
      httpOnly: false, //set this to true in production
      path: "/",
      secure: false,
      sameSite: true,
    });

    return res.status(201).json({
      status: "201",
      message: "Patient authenticated successfully",
      data: token,
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

exports.PatientRequests = async (req, res) => {
  try {
    const result = await RegisterRequest.find({});

    return res.status(201).json({
      status: "201",
      message: "Patient Requests Retrieved Successfully",
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

exports.PatientRequest = async (req, res) => {
  try {
    const validated = await GetValidation.validateAsync(req.query);

    const request = await RegisterRequest.findOne({ requestId: validated.id });

    console.log(request);

    if (!request) {
      return res.status(404).json({
        status: "404",
        message: "No Patient Request Found",
        data: null,
      });
    }

    const patient = await Patient.findOne(
      { nic: request.nic },
      { password: 0 }
    );

    let result = {
      nic: patient.nic,
      fullname: patient.fullname,
      address: patient.address,
      selfieKey: patient.selfieKey,
      idFrontKey: patient.idFrontKey,
      idBackKey: patient.idBackKey,
      createdDate: request.createdDate,
      kycResult: request.kycResult,
      ocrResult: {
        nic: patient.nic,
        fullname: patient.name,
        address: patient.address,
      },
      requestId: request.requestId,
    };

    console.log(patient);
    console.log(result);

    return res.status(201).json({
      status: "201",
      message: "Patient Request Retrieved Successfully",
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

exports.PatientRequestApprove = async (req, res) => {
  try {
    const validated = await GetValidation.validateAsync(req.query);

    const update = await RegisterRequest.findOneAndUpdate(
      { requestId: validated.id },
      { $set: { activated: "TRUE" } },
      {
        new: true,
      }
    );

    const update1 = await Patient.findOneAndUpdate(
      { nic: update.nic },
      { $set: { status: "ACTIVE" } },
      {
        new: true,
      }
    );

    let token = uuidv4();
    let tokenSent = moment().unix();

    await Patient.findOneAndUpdate(
      { nic: update.nic },
      { $set: { passwordToken: token, passwordTokenSent: tokenSent } },
      {
        new: true,
      }
    );

    let m = update1.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Welcome to NeuroMed. Your account has been verified. Please use the first link to create a new password https://health.neuromed.shop/password-create/${token}`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    const patientData = await Patient.findOne(
      { nic: update.nic },
      {
        passwordToken: 0,
        passwordTokenSent: 0,
        medicareID: 0,
        nic: 0,
        profile: 0,
        email: 0,
        password: 0,
        otp: 0,
        otpSent: 0,
        role: 0,
        passwordReset: 0,
        token: 0,
        tokenSent: 0,
      }
    );

    //delete from database

    //sending data to IPFS
    let idata = { ...patientData._doc };

    console.log(idata, "IDATA");

    let options = {
      warpWithDirectory: true,
      progress: (prog) => console.log(`Saved : ${prog}`),
    };

    let filename = `PII-${uuidv4()}.json`;

    let encryptedData = encrypt(JSON.stringify(idata));

    const result2 = await client.add(
      {
        path: filename,
        content: encryptedData,
      },
      options
    );

    console.log(result2.cid);

    const asyncitr = client.cat(result2.cid);

    //send this cid to blockchain
    const getPatient = await Patient.findOne({ nic: update.nic });

    // creating transation
    console.log(getPatient.medicareID, getPatient.nic, result2.cid);
    tx = await storeUser(getPatient.medicareID, getPatient.nic, result2.cid);

    console.log("Transcation block No: " + tx.blockNumber);

    // for await (const itr of asyncitr) {
    //   //   console.log(itr);
    //   console.log(Buffer.from(itr).toString());
    //   hash = Buffer.from(itr).toString();
    // }

    // console.log(asyncitr, "Uploaded to the IPFS");

    return res.status(201).json({
      status: "201",
      message:
        "Patient Request Activated Successfully. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: {
        id: update1.medicareID,
        nic: update1.nic,
        path: result2.path,
      },
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

exports.PatientRequestReject = async (req, res) => {
  try {
    const validated = await GetValidation.validateAsync(req.query);

    const update = await RegisterRequest.findOneAndUpdate(
      { requestId: validated.id },
      { $set: { activated: "REJECTED" } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message: "Patient Request Rejected Successfully",
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

exports.PasswordReset = async (req, res) => {
  try {
    const validated = await PasswordResetValidation.validateAsync(
      req.body.data
    );

    const patient = await Patient.findOne({
      passwordToken: validated.passwordToken,
    });

    if (!patient) {
      return res.status(404).json({
        status: "404",
        message: "Patient Does Not Exists",
        data: null,
      });
    }

    if (patient.status === "INACTIVE") {
      return res.status(403).json({
        status: "403",
        message: "Patient Does not activated yet",
        data: null,
      });
    }

    if (validated.password !== validated.confirmPassword) {
      return res.status(403).json({
        status: "403",
        message: "Passwords does not match",
        data: null,
      });
    }

    // generate hash
    const hash = bcrypt.hashSync(validated.password, 10);
    console.log(hash);

    await Patient.findOneAndUpdate(
      { nic: patient.nic },
      { $set: { password: hash } },
      {
        new: true,
      }
    );

    return res.status(201).json({
      status: "201",
      message:
        "Password reseted successfully Successfully, Please Procees to Login",
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

exports.GetImages = async (req, res) => {
  try {
    console.log(req.params);
    const key = req.params.key;
    const readStream = getFileStream1(key);

    console.log(readStream);
    readStream.pipe(res);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      status: "500",
      message: "Something went wrong, please try again later",
      data: null,
    });
  }
};
