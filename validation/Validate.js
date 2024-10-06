const Joi = require("joi");

const RegisterValidation = Joi.object({
  title: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  dob: Joi.string().required(),
  nic: Joi.string().required(),
  gender: Joi.string().required(),
  address1: Joi.string().required(),
  hospitalId: Joi.string().allow("").optional(),
  hospitalName: Joi.string().allow("").optional(),
  address2: Joi.string().required(),
  wallet: Joi.string().required(),
  role: Joi.string().required(),
  email: Joi.string().min(3).max(30).required().label("Email"),
  mobile: Joi.string().required().label("Phone number"),
  password: Joi.string().required().label("Password"),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .label("Confirm Password"),
});

const LoginValidation = Joi.object({
  email: Joi.string().max(30).required().label("Email"),
  password: Joi.string().required().label("Password"), //check password strength
});

const AdminLoginValidation = Joi.object({
  email: Joi.string().max(30).required().label("Email"),
  password: Joi.string().required().label("Password"), //check password strength
  role: Joi.string()
    .required()
    .valid(...["Medical Rep", "Hospital Admin", "Doctor"])
    .label("Role"),
});

const StaffLoginValidation = Joi.object({
  email: Joi.string().max(30).required().label("Email"),
  password: Joi.string().required().label("Password"), //check password strength
  role: Joi.string()
    .required()
    .valid(...["Hospital Staff", "Lab Assistant"])
    .label("Role"),
});

const PatientRegisterValidation = Joi.object({
  title: Joi.string().required(),
  address: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  fullname: Joi.string().required(),
  dob: Joi.string().required(),
  nic: Joi.string().required(),
  gender: Joi.string().required(),
  guardianName: Joi.string().required(),
  guardianNic: Joi.string().required(),
  guardianAddress: Joi.string().required(),
  guardianRelationship: Joi.string().required(),
  guardianNumber: Joi.string().required(),
  role: Joi.string().required(),
  email: Joi.string().min(3).max(30).required().label("Email"),
  mobile: Joi.string().required().length(10).label("Phone number"),
  landphone: Joi.string().required().label("Land number"),
  registrationDate: Joi.string().required(),
  city: Joi.string().required(),
  postalCode: Joi.string().required(),
  wallet: Joi.string().required(),
  hospitalId: Joi.string().required(),
});

const EHRValidation = Joi.object({
  nic: Joi.string().required(),
  fullname: Joi.string().required(),
  doctor: Joi.string().required(),
  allergies: Joi.string().required(),
  blood: Joi.string().required(),
  lastDate: Joi.string().required(),
  illnesses: Joi.array().required(),
  hypertension: Joi.string().required(),
  heartDisease: Joi.string().required(),
  everMarried: Joi.string().required(),
  workType: Joi.string().required(),
  ResidenceType: Joi.string().required(),
  avgGlucoseLevel: Joi.string().required(),
  bmi: Joi.string().required(),
  smokingStatus: Joi.string().required(),
  weight: Joi.string().required(),
  metformin: Joi.string().required(),
  insulin: Joi.string().required(),
  miglitol: Joi.string().required(),
  geneticRisk: Joi.string().required(),
  chestPain: Joi.string().required(),
  lungRealatedComplexities: Joi.string().required(),
  shortnessOfBreath: Joi.string().required(),
  snoring: Joi.string().required(),
  smokingHabits: Joi.string().required(),
});

const NewEHRValidation = Joi.object({
  nic: Joi.string().required(),
  fullname: Joi.string().required(),
  doctor: Joi.string().required(),
  date: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  medication: Joi.string().required(),
  injuries: Joi.string().required(),
});

const CreateInvoiceValidation = Joi.object({
  nic: Joi.string().required(),
  lab: Joi.string().required(),
  date: Joi.string().required(),
  doctor: Joi.string().required(),
  hospital: Joi.string().required(),
});

const GetValidation = Joi.object({
  id: Joi.string().required(),
});

const PatientValidationNIC = Joi.object({
  nic: Joi.string().required(),
});

const PatientValidationOTP = Joi.object({
  otp: Joi.string().length(6).required(),
  nic: Joi.string().required(),
});

const PatientValidationLogin = Joi.object({
  nic: Joi.string().required(),
  password: Joi.string().required(),
});

const UploadCBPValidation = Joi.object({
  nic: Joi.string().required(),
  gender: Joi.string().required(),
  fullname: Joi.string().required(),
  dob: Joi.string().required(),
  doctor: Joi.string().required(),
  hospital: Joi.string().required(),
  invoiceRef: Joi.string().required(),
  collectedOn: Joi.string().required(),
  HEMOGLOBIN: Joi.string().required(),
  PCV: Joi.string().required(),
  TRBC: Joi.string().required(),
  platelet: Joi.string().required(),
  TWBC: Joi.string().required(),
  NEUTROPHILS: Joi.string().required(),
  LYMPHOCYTES: Joi.string().required(),
  EOSINOPHILS: Joi.string().required(),
  MONOCYTES: Joi.string().required(),
  BASOPHILS: Joi.string().required(),
  RBCMORPHOLOGY: Joi.string().required(),
  WBC: Joi.string().required(),
  PLATEKETS: Joi.string().required(),
});

const UploadCBPUrineValidation = Joi.object({
  nic: Joi.string().required(),
  gender: Joi.string().required(),
  fullname: Joi.string().required(),
  dob: Joi.string().required(),
  doctor: Joi.string().required(),
  hospital: Joi.string().required(),
  invoiceRef: Joi.string().required(),
  collectedOn: Joi.string().required(),
  quantity: Joi.string().required(),
  colour: Joi.string().required(),
  appearance: Joi.string().required(),
  specificGravity: Joi.string().required(),
  proteins: Joi.string().required(),
  glucose: Joi.string().required(),
  urineKetones: Joi.string().required(),
  reaction: Joi.string().required(),
  occultBlood: Joi.string().required(),
  bileSalts: Joi.string().required(),
  bilePigments: Joi.string().required(),
  urobilinogen: Joi.string().required(),
  epithelialCells: Joi.string().required(),
  pusCells: Joi.string().required(),
  redBloodCells: Joi.string().required(),
  casts: Joi.string().required(),
  crystals: Joi.string().required(),
  amorphousMaterial: Joi.string().required(),
  yeastCells: Joi.string().required(),
  bacteria: Joi.string().required(),
  trichomonasVaginalis: Joi.string().required(),
  speramatozoa: Joi.string().required(),
});

const UploadLFRValidation = Joi.object({
  nic: Joi.string().required(),
  gender: Joi.string().required(),
  fullname: Joi.string().required(),
  dob: Joi.string().required(),
  doctor: Joi.string().required(),
  hospital: Joi.string().required(),
  invoiceRef: Joi.string().required(),
  collectedOn: Joi.string().required(),
  biiirubinTotal: Joi.string().required(),
  biiirubinDirect: Joi.string().required(),
  biiirubinIndirect: Joi.string().required(),
  sgpt: Joi.string().required(),
  sgot: Joi.string().required(),
  alkalinePhosphatase: Joi.string().required(),
  totalProteins: Joi.string().required(),
  albumin: Joi.string().required(),
  globulin: Joi.string().required(),
  agRatio: Joi.string().required(),
});

const NormalEhrRequestValidation = Joi.object({
  nic: Joi.string().required(),
});

const SubmitEHRResponseValidation = Joi.object({
  id: Joi.string().required(),
  res: Joi.string().required(),
});

const CreateHospitalValidation = Joi.object({
  hospitalId: Joi.string().required(),
  hospitalName: Joi.string().required(),
});

const PasswordResetValidation = Joi.object({
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  passwordToken: Joi.string().required(),
});

module.exports = {
  RegisterValidation,
  LoginValidation,
  AdminLoginValidation,
  StaffLoginValidation,
  PatientRegisterValidation,
  CreateInvoiceValidation,
  EHRValidation,
  GetValidation,
  PatientValidationNIC,
  PatientValidationOTP,
  PatientValidationLogin,
  UploadCBPValidation,
  UploadCBPUrineValidation,
  UploadLFRValidation,
  NormalEhrRequestValidation,
  CreateHospitalValidation,
  PasswordResetValidation,
  NewEHRValidation,
  SubmitEHRResponseValidation,
};
