const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");

//schema
const { Admin } = require("../schema/Admin");
const { Patient } = require("../schema/Patient");
const { Hospital } = require("../schema/Hospital");

//validation
const {
  RegisterValidation,
  LoginValidation,
  AdminLoginValidation,
  StaffLoginValidation,
  PatientRegisterValidation,
} = require("../validation/Validate");

const {
  createSuperAdmin,
  createAdmin,
  createStaff,
} = require("../util/blockchain");

function generateAccessToken(medicareID, role, profile, firstname, lastname) {
  // expires in 24h
  let user = {
    admin: true,
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

exports.SuperadminLogin = async (req, res) => {
  try {
    const validated = await LoginValidation.validateAsync(req.body.data);

    //check user exists
    const user = await Admin.findOne({ email: validated.email });
    // console.log(user);

    if (!user) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //compare hash
    const verify = bcrypt.compareSync(validated.password, user.password);
    console.log(verify);

    if (!verify) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //create jwt token
    let token = generateAccessToken(
      user.medicareID,
      "Neuromed",
      user.profile,
      user.firstname,
      user.lastname
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
      message: "User authenticated successfully",
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

exports.AdminLogin = async (req, res) => {
  try {
    const validated = await AdminLoginValidation.validateAsync(req.body.data);

    //check user exists
    const user = await Admin.findOne({ email: validated.email });
    // console.log(user);

    if (!user) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    if (user.role !== validated.role) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //compare hash
    const verify = bcrypt.compareSync(validated.password, user.password);
    console.log(verify);

    if (!verify) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //create jwt token
    let token = generateAccessToken(
      user.medicareID,
      user.role,
      user.profile,
      user.firstname,
      user.lastname
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
      message: "User authenticated successfully",
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

exports.StaffLogin = async (req, res) => {
  try {
    const validated = await StaffLoginValidation.validateAsync(req.body.data);

    //check user exists
    const user = await Admin.findOne({ email: validated.email });
    // console.log(user);

    if (!user) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    if (user.role !== validated.role) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //compare hash
    const verify = bcrypt.compareSync(validated.password, user.password);
    console.log(verify);

    if (!verify) {
      return res.status(403).json({
        status: "403",
        message: "Email or password is invalid",
      });
    }

    //create jwt token
    let token = generateAccessToken(
      user.medicareID,
      user.role,
      user.profile,
      user.firstname,
      user.lastname
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
      message: "User authenticated successfully",
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

exports.SuperadminRegister = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await RegisterValidation.validateAsync(req.body.data);
    console.log(validated);

    let user = await Admin.findOne({ email: validated.email });
    if (user) {
      return res.status(403).json({
        status: "403",
        message: "User already registered",
      });
    }

    let role = "";
    // [
    //   ("HA000000001", "MR000000001", "D000000001", "L000000001")
    // ];
    console.log(validated);

    switch (validated.role) {
      case "Neuromed":
        role = "NM";
        break;
      default:
        return res.status(403).json({
          status: "403",
          message: "Invalid Role",
        });
    }

    const lastUser = await Admin.find({ role: validated.role })
      .sort({ _id: -1 })
      .limit(1);

    let medicareID = "000000001";

    if (lastUser.length > 0) {
      let id = lastUser[0].medicareID.slice(2);
      let idText = parseInt(id) + 1;
      let text = idText.toString();

      if (text.length < 9) {
        let zeros = 9 - text.length;
        let zero = "0";
        let zeroString = zero.repeat(zeros);

        medicareID = zeroString.concat(text);
        console.log(medicareID);
      }
    }

    //compare two passwords
    if (validated.password !== validated.confirmPassword) {
      return res.status(403).json({
        status: "403",
        message: "Password does not match",
      });
    }

    // generate hash
    const hash = bcrypt.hashSync(validated.password, 10);
    console.log(hash);

    // creating transation
    const tx = await createSuperAdmin(
      role.concat(medicareID),
      validated.wallet
    );

    console.log("Transcation block No: " + tx.blockNumber);

    // create user
    const data = new Admin({
      createdDate: Date.now(),
      medicareID: role.concat(medicareID),
      title: validated.title,
      firstname: validated.firstname,
      lastname: validated.lastname,
      dob: validated.dob,
      nic: validated.nic,
      gender: validated.gender,
      address1: validated.address1,
      address2: validated.address2,
      hospitalId: validated.hospitalId || "",
      hospitalName: validated.hospitalName || "",
      role: validated.role,
      profile: `https://joeschmoe.io/api/v1/${
        Math.floor(Math.random() * 90000) + 10000
      }`,
      mobile: validated.mobile,
      password: hash,
      email: validated.email,
      wallet: validated.wallet,
    });

    const result = await data.save();
    console.log(result);

    return res.status(201).json({
      status: "201",
      message:
        "User created successfully, Please login. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: {
        medicareID: role.concat(medicareID),
        wallet: validated.wallet,
      },
    });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(500).json({
        status: "500",
        message: "Please provide your own details",
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "500",
        message: "Something went wrong, please try again later",
        data: null,
      });
    }
  }
};

exports.AdminRegister = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await RegisterValidation.validateAsync(req.body.data);
    console.log(validated);

    let user = await Admin.findOne({ email: validated.email });
    if (user) {
      return res.status(403).json({
        status: "403",
        message: "User already registered",
      });
    }

    let hospital = await Hospital.findOne({
      hospitalId: validated.hospitalId,
    });
    if (!hospital) {
      return res.status(403).json({
        status: "403",
        message: "Hospital Id does not exists",
      });
    }

    let role = "";
    let hashedRole = "";
    // [
    //   ("HA000000001", "MR000000001", "D000000001", "L000000001")
    // ];
    console.log(validated);

    switch (validated.role) {
      case "Hospital Admin":
        role = "HA";
        hashedRole =
          "0x8422142255c844d3d4a5104b709d1da65e3e4b88bc607f47279dd1baf7acc808";
        break;
      case "Medical Rep":
        role = "MR";
        hashedRole =
          "0xc2af34e7cc1f3d8808f569d6d46a95c4217b618edefc26d793e3a6c23dfe262f";
        break;
      case "Doctor":
        role = "DR";
        hashedRole =
          "0xc9c8e67a61d2e7371df46522b44051b955c16bf4b713ef44e1373b25bfcd80b2";
        break;
      default:
        return res.status(403).json({
          status: "403",
          message: "Invalid Role",
        });
    }

    const lastUser = await Admin.find({ role: validated.role })
      .sort({ _id: -1 })
      .limit(1);

    let medicareID = "000000001";

    if (lastUser.length > 0) {
      let id = lastUser[0].medicareID.slice(2);
      let idText = parseInt(id) + 1;
      let text = idText.toString();

      if (text.length < 9) {
        let zeros = 9 - text.length;
        let zero = "0";
        let zeroString = zero.repeat(zeros);

        medicareID = zeroString.concat(text);
        console.log(medicareID);
      }
    }

    //compare two passwords
    if (validated.password !== validated.confirmPassword) {
      return res.status(403).json({
        status: "403",
        message: "Password does not match",
      });
    }

    //generate hash
    const hash = bcrypt.hashSync(validated.password, 10);
    console.log(hash);

    // creating transation
    const tx = await createAdmin(
      role.concat(medicareID),
      validated.wallet,
      hashedRole,
      hospital.hospitalId
    );

    console.log("Transcation block No: " + tx.blockNumber);

    //create user
    const data = new Admin({
      createdDate: Date.now(),
      medicareID: role.concat(medicareID),
      title: validated.title,
      firstname: validated.firstname,
      lastname: validated.lastname,
      dob: validated.dob,
      nic: validated.nic,
      gender: validated.gender,
      hospitalId: hospital.hospitalId,
      hospitalName: hospital.hospitalName,
      address1: validated.address1,
      address2: validated.address2,
      role: validated.role,
      profile: `https://joeschmoe.io/api/v1/${
        Math.floor(Math.random() * 90000) + 10000
      }`,
      mobile: validated.mobile,
      password: hash,
      email: validated.email,
      wallet: validated.wallet,
    });

    const result = await data.save();
    console.log(result);

    return res.status(201).json({
      status: "201",
      message:
        "User created successfully, Please login. " +
        "Transcation block No: " +
        tx.blockNumber,
      data: {
        medicareId: role.concat(medicareID),
        hospitalId: hospital.hospitalId,
      },
    });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(500).json({
        status: "500",
        message: "Please provide your own details",
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "500",
        message: "Something went wrong, please try again later",
        data: null,
      });
    }
  }
};

exports.StaffRegister = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await RegisterValidation.validateAsync(req.body.data);
    console.log(validated);

    let user = await Admin.findOne({ email: validated.email });
    if (user) {
      return res.status(403).json({
        status: "403",
        message: "User already registered",
      });
    }

    let hospital = await Hospital.findOne({ hospitalId: validated.hospitalId });
    if (!hospital) {
      return res.status(403).json({
        status: "403",
        message: "Hospital Id does not exists",
      });
    }

    let role = "";
    let hashedRole = "";

    switch (validated.role) {
      case "Lab Assistant":
        role = "LA";
        hashedRole =
          "0xfff7b8e4ac10566d090c9cdfc71d80fcc431b76ce09edaddaa421288a053208a";
        break;
      case "Hospital Staff":
        role = "HS";
        hashedRole = "";
        break;
      default:
        return res.status(403).json({
          status: "403",
          message: "Invalid Role",
        });
    }

    const lastUser = await Admin.find({ role: validated.role })
      .sort({ _id: -1 })
      .limit(1);

    let medicareID = "000000001";

    if (lastUser.length > 0) {
      let id = lastUser[0].medicareID.slice(2);
      let idText = parseInt(id) + 1;
      let text = idText.toString();

      if (text.length < 9) {
        let zeros = 9 - text.length;
        let zero = "0";
        let zeroString = zero.repeat(zeros);

        medicareID = zeroString.concat(text);
        console.log(medicareID);
      }
    }

    //compare two passwords
    if (validated.password !== validated.confirmPassword) {
      return res.status(403).json({
        status: "403",
        message: "Password does not match",
      });
    }

    //generate hash
    const hash = bcrypt.hashSync(validated.password, 10);
    console.log(hash);

    let tx;

    if (validated.role === "Lab Assistant") {
      // creating transation
      tx = await createStaff(
        role.concat(medicareID),
        validated.wallet,
        hashedRole,
        hospital.hospitalId
      );

      console.log("Transcation block No: " + tx.blockNumber);
    }

    //create user
    const data = new Admin({
      createdDate: Date.now(),
      medicareID: role.concat(medicareID),
      title: validated.title,
      firstname: validated.firstname,
      lastname: validated.lastname,
      dob: validated.dob,
      nic: validated.nic,
      gender: validated.gender,
      hospitalId: hospital.hospitalId,
      hospitalName: hospital.hospitalName,
      address1: validated.address1,
      address2: validated.address2,
      role: validated.role,
      profile: `https://joeschmoe.io/api/v1/${
        Math.floor(Math.random() * 90000) + 10000
      }`,
      mobile: validated.mobile,
      password: hash,
      email: validated.email,
      wallet: validated.wallet,
    });

    const result = await data.save();
    console.log(result);

    if (validated.role === "Lab Assistant") {
      return res.status(201).json({
        status: "201",
        message:
          "User created successfully, Please login. " +
          "Transcation block No: " +
          tx.blockNumber,
        data: null,
      });
    }

    return res.status(201).json({
      status: "201",
      message: "User created successfully, Please login.",
      data: null,
    });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(500).json({
        status: "500",
        message: "Please provide your own details",
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "500",
        message: "Something went wrong, please try again later",
        data: null,
      });
    }
  }
};

exports.PatientRegister = async (req, res) => {
  try {
    console.log(req.body.data);
    const validated = await PatientRegisterValidation.validateAsync(
      req.body.data
    );
    console.log(validated);

    let user = await Patient.findOne({ nic: validated.nic });
    if (user) {
      return res.status(403).json({
        status: "403",
        message: "User already registered",
      });
    }

    let role = "PA";
    // [
    //   ("HA000000001", "MR000000001", "D000000001", "L000000001")
    // ];
    console.log(validated);

    const lastUser = await Patient.find({ role: validated.role })
      .sort({ _id: -1 })
      .limit(1);

    let medicareID = "000000001";

    if (lastUser.length > 0) {
      let id = lastUser[0].medicareID.slice(2);
      let idText = parseInt(id) + 1;
      let text = idText.toString();

      if (text.length < 9) {
        let zeros = 9 - text.length;
        let zero = "0";
        let zeroString = zero.repeat(zeros);

        medicareID = zeroString.concat(text);
        console.log(medicareID);
      }
    }

    //create user
    const data = new Patient({
      createdDate: Date.now(),
      medicareID: role.concat(medicareID),
      title: validated.title,
      address: validated.address,
      firstname: validated.firstname,
      lastname: validated.lastname,
      fullname: validated.fullname,
      dob: validated.dob,
      nic: validated.nic,
      gender: validated.gender,
      guardianName: validated.guardianName,
      guardianNic: validated.guardianNic,
      guardianAddress: validated.guardianAddress,
      guardianRelationship: validated.guardianRelationship,
      guardianNumber: validated.guardianNumber,
      role: "Patient",
      profile: `https://joeschmoe.io/api/v1/${
        Math.floor(Math.random() * 90000) + 10000
      }`,
      email: validated.email,
      mobile: validated.mobile,
      landphone: validated.landphone,
      registrationDate: validated.registrationDate,
      city: validated.city,
      postalCode: validated.postalCode,
      wallet: validated.wallet,
      hospitalId: validated.hospitalId,
      password: "",
      status: "INACTIVE",
    });

    const result = await data.save();
    console.log(result);

    let m = validated.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Your registration is successful. Please use the below link to proceed to the activation https://health.neuromed.shop/patient-activation`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    return res.status(201).json({
      status: "201",
      message: "Patient created successfully",
      data: null,
    });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(500).json({
        status: "500",
        message: "Please provide your own details",
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "500",
        message: "Something went wrong, please try again later",
        data: null,
      });
    }
  }
};

exports.IsAdmin = async (req, res) => {
  try {
    // Gather the jwt access token from the request header
    console.log(req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];

      //load publicKey
      let publicKey = fs.readFileSync("./keys/jwt_private.pem", "utf8");

      jwt.verify(
        idToken,
        publicKey,
        { algorithms: ["RS256"] },
        (err, decoded) => {
          console.log(err);

          if (
            err ||
            decoded.authenticated === false ||
            decoded.iat > new Date()
          ) {
            return res
              .status(403)
              .json({ status: "403", message: "Unauthorized", data: null });
          }

          console.log(decoded);

          return res
            .status(200)
            .json({ status: "200", message: "Authorized", data: decoded });
        }
      );
    } else {
      console.error("No token found");
      return res
        .status(403)
        .json({ status: "403", message: "Unauthorized", data: null });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "500",
      message: "Something went wrong, please try again later",
      data: null,
    });
  }
};
