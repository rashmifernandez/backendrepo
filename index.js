///imoprts
const express = require("express");
const cors = require("cors");
const connect = require("./connection");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const jwt = require("jsonwebtoken");
const https = require("https");
const path = require("path");

// const rateLimit = require("express-rate-limit");
require("dotenv").config();
const upload = require("./util/upload");

connect();
var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://35.240.133.108:3000/",
      "https://health.neuromed.shop/",
      "https://health.neuromed.shop",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

const {
  SuperadminRegister,
  SuperadminLogin,
  AdminRegister,
  AdminLogin,
  StaffRegister,
  StaffLogin,
  PatientRegister,
} = require("./api/Authentication");

const { CreateInvoice, GetInvoices, GetInvoice } = require("./api/Invoice");
const { SearchPatientForLabs, SearchInvoiceForLabs } = require("./api/Labs");
const {
  CreateEHR,
  CreateNewEHR,
  GetEHRs,
  GetEHR,
  GetEHRList,
  NormalEhrRequest,
  CriticalEhrRequest,
  SubmitEHRResponse,
} = require("./api/EHR");
const {
  PatientActivationNIC,
  PatientActivationOTP,
  PatientActivationFrontImage,
  PatientLogin,
  PatientActivationIdFront,
  PatientActivationIdFBack,
  PatientLoginOTP,
  PatientRequests,
  PatientRequest,
  GetImages,
  PatientRequestApprove,
  PatientRequestReject,
  PasswordReset,
} = require("./api/PatientActivation");
const {
  UploadCBP,
  UploadUrineRoutine,
  UploadLFR,
  SearchLabReports,
} = require("./api/LabReports");
const { CreateHospital } = require("./api/Hospital");
const { generatePDF, verify } = require("./api/Pdf");

//routes
app.get("/images/:key", GetImages);
app.get("/verify", verify);

// app.post("/login", LoginLimiter, Login);
app.post("/superadmin-register", checkAuth(["Neuromed"]), SuperadminRegister);
app.post("/superadmin-login", SuperadminLogin);
app.post("/admin-register", checkAuth(["Neuromed"]), AdminRegister);
app.post("/admin-login", AdminLogin);
app.post("/staff-register", checkAuth(["Hospital Admin"]), StaffRegister);
app.post("/staff-login", StaffLogin);
app.post(
  "/patient-register",
  checkAuth(["Hospital Staff", "Lab Assistant"]),
  PatientRegister
);

app.post("/create-invoice", checkAuth(["Lab Assistant"]), CreateInvoice);
app.get("/invoices", checkAuth(["Lab Assistant"]), GetInvoices);
app.get("/invoice", checkAuth(["Lab Assistant"]), GetInvoice);
app.post("/upload-cbp", checkAuth(["Lab Assistant"]), UploadCBP);
app.post(
  "/upload-urine-routine",
  checkAuth(["Lab Assistant"]),
  UploadUrineRoutine
);
app.post("/upload-lfr", checkAuth(["Lab Assistant"]), UploadLFR);

app.get("/search-patient-lab", SearchPatientForLabs);
app.get("/search-invoice-lab", SearchInvoiceForLabs);

app.post("/patient-activation-nic", PatientActivationNIC);
app.post("/patient-activation-otp", PatientActivationOTP);
app.post(
  "/patient-activation-front",
  upload.single("image"),
  PatientActivationFrontImage
);
app.post(
  "/patient-activation-idfront",
  upload.single("image"),
  PatientActivationIdFront
);
app.post(
  "/patient-activation-idback",
  upload.single("image"),
  PatientActivationIdFBack
);
// app.post("/patient-activation-idback", PatientActivationIdFBack);

app.get("/patient-requests", checkAuth(["Medical Rep"]), PatientRequests);
app.get("/patient-request", checkAuth(["Medical Rep"]), PatientRequest);

app.get("/search-lab-report", checkAuth(["Patient"]), SearchLabReports);

app.post("/create-ehr", checkAuth(["Doctor", "Medical Rep"]), CreateEHR);
app.post("/create-new-ehr", checkAuth(["Doctor"]), CreateNewEHR);

app.post("/normal-ehr-request", checkAuth(["Doctor"]), NormalEhrRequest);
app.post("/critical-ehr-request", checkAuth(["Doctor"]), CriticalEhrRequest);
app.post("/submit-ehr-response", checkAuth(["Patient"]), SubmitEHRResponse);

app.get("/get-ehrs", checkAuth(["Doctor"]), GetEHRs);
app.get("/get-ehr", checkAuth(["Doctor"]), GetEHR);
app.get("/get-ehr-list", checkAuth(["Patient"]), GetEHRList);

app.post("/password-reset", PasswordReset);
app.post("/patient-login", PatientLogin);
app.post("/patient-login-otp", PatientLoginOTP);

app.post("/create-hospital", CreateHospital);
app.get("/patient-request-approve", PatientRequestApprove);
app.get("/patient-request-reject", PatientRequestReject);

app.get("/generate-pdf", checkAuth(["Patient"]), generatePDF);

// app.get("/admin", IsAdmin);

function checkAuth(roles) {
  return function (req, res, next) {
    try {
      // Gather the jwt access token from the request header
      // console.log(req.headers.authorization);

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        idToken = req.headers.authorization.split("Bearer ")[1];

        jwt.verify(
          idToken,
          "AKIAURO2OFILH25ELFJR",
          { algorithms: ["HS512"] },
          function (err, decoded) {
            if (
              err ||
              decoded.authenticated === false ||
              decoded.iat > new Date() ||
              !roles.includes(decoded.role)
            ) {
              return res
                .status(403)
                .json({ status: "403", message: "Unauthorized", data: null });
            }
            req.token = decoded;
            next();
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
}

const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/cert.pem")),
};

const server = https.createServer(options, app).listen(5000, () => {
  console.log("server running at " + 5000);
});

// var server = app.listen(5000, function () {
//   var host = server.address().address;
//   var port = server.address().port;

//   console.log("Example app listening at http://%s:%s", host, port);
// });
