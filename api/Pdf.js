const { v4: uuidv4 } = require("uuid");
const QRGEN = require("qrcode");
const crypto = require("crypto");
const fs = require("fs");
const qpdf = require("node-qpdf");
const html_to_pdf = require("html-pdf-node");
const Mustache = require("mustache");
const { create } = require("ipfs-http-client");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const axios = require("axios");

const { getLabReport } = require("../util/blockchain");
const { uploadFileWithoutRotate } = require("../util/s3");

const { Invoice } = require("../schema/Invoice");
const { Patient } = require("../schema/Patient");
const { QR } = require("../schema/QR");

const { decrypt } = require("../util/encryption");

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

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.generatePDF = async (req, res) => {
  try {
    let refId = req.query.id;

    console.log(refId);
    const invoice = await Invoice.findOne({ invoiceRef: refId });

    if (!invoice) {
      return res.status(404).json({
        status: "404",
        message: "Invoice not found",
      });
    }

    const user = await Patient.findOne({ nic: invoice.patientNic });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        status: "404",
        message: "Patient does not exists",
      });
    }

    console.log(user.medicareID);

    // creating transation
    const tx = await getLabReport(user.medicareID);
    console.log(tx);

    if (tx.length === 0) {
      return res.status(404).json({
        status: "404",
        message: "Invoice not found",
      });
    }

    let dataToPrint = {};

    for (let index = 0; index < tx.length; index++) {
      const asyncitr = client.cat(tx[index]);

      for await (const itr of asyncitr) {
        console.log(
          JSON.parse(decrypt(Buffer.from(itr).toString())).invoiceRef,
          refId
        );

        if (
          JSON.parse(decrypt(Buffer.from(itr).toString())).invoiceRef === refId
        ) {
          dataToPrint = JSON.parse(decrypt(Buffer.from(itr).toString()));
        }
        // console.log(JSON.parse(Buffer.from(itr).toString()).invoiceRef);
      }
    }

    if (dataToPrint && Object.keys(dataToPrint).length === 0) {
      return res.status(400).json({
        status: "400",
        message: "Lab report does not exists",
        data: null,
      });
    }

    // ******************************* QR
    //generate hash
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(dataToPrint))
      .digest("base64");

    let privateKey = fs.readFileSync("./keys/private.pem", "utf8");

    const encrypt = crypto.privateEncrypt(
      {
        key: privateKey,
      },
      Buffer.from(hash, "base64")
    );

    let url = `https://health.neuromed.shop/verify/${
      dataToPrint.invoiceRef
    }/${encrypt.toString("base64")}`;

    const qr = await QRGEN.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
    });

    let filename = `${uuidv4()}.png`;
    let filepath = `./qr/${uuidv4()}.png`;

    const dataa = qr.split(",")[1];
    const buf = Buffer.from(dataa, "base64");
    fs.writeFileSync(filepath, buf);

    // ******************************* QR

    let file = {
      filename: filename,
      path: filepath,
    };

    const uploadqr = await uploadFileWithoutRotate(file);

    const imagePath = uploadqr.Key;
    console.log(imagePath);

    //deleting from the file system after upload is completed
    await unlinkFile(file.path);

    let options = { format: "A4" };
    let encFile = `${dataToPrint.invoiceRef}-enc.pdf`;
    let norFile = `${dataToPrint.invoiceRef}.pdf`;
    let password = makeid(8);

    console.log(password);

    let filetype = refId.split("-")[0];
    let data;

    if (filetype === "CBP") {
      data = fs.readFileSync(`./template.html`, {
        encoding: "utf8",
        flag: "r",
      });
    }

    if (filetype === "LFR") {
      data = fs.readFileSync(`./template1.html`, {
        encoding: "utf8",
        flag: "r",
      });
    }

    let s3url = `https://patientkyc.s3.amazonaws.com/${imagePath}`;
    // dataToPrint.image = qr;
    dataToPrint.image = s3url;

    const qrdata = new QR({
      invoiceRef: dataToPrint.invoiceRef,
      hash: hash,
      signature: encrypt.toString("base64"),
      url: url,
      image: s3url,
      medicareID: user.medicareID,
    });

    await qrdata.save();

    const filledTemplate = Mustache.render(data, dataToPrint);

    // console.log(filledTemplate);
    let htmlfile = { content: filledTemplate };

    let m = user.mobile.substring(1);
    let mobile = "94".concat(m);

    let message = `Please use this one time password to unlock the lab report in the pdf. Password - ${password}`;

    await axios.get(
      `https://app.notify.lk/api/v1/send?user_id=23608&api_key=GrfcK9978sTkVsATKgmf&sender_id=NotifyDEMO&to=${mobile}&message=${message}`
    );

    html_to_pdf.generatePdf(htmlfile, options).then(async (pdfBuffer) => {
      console.log("PDF Buffer:-", pdfBuffer);
      fs.writeFileSync(`./pdf/${norFile}`, pdfBuffer);

      var options = {
        keyLength: 256,
        password: password,
        outputFile: `./pdf/${encFile}`,
        restrictions: {
          modify: "none",
          extract: "n",
        },
      };

      await qpdf.encrypt(`./pdf/${norFile}`, options);

      res.download(`./pdf/${encFile}`, `./pdf/${norFile}`, (err) => {
        if (err) {
          res.send({
            error: err,
            msg: "Problem downloading the file",
          });
        }
      });
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

let referenceNo = "";

exports.verify = async (req, res) => {
  try {
    let refId = req.query.id;
    let signature = req.query.signature;
    referenceNo = refId;
    // let refId = "CBP-c3a2e4b3";
    console.log(refId);
    const invoice = await QR.findOne({ invoiceRef: refId });

    if (!invoice) {
      return res.status(404).json({
        status: "404",
        message: "Invoice not found",
      });
    }

    //load publicKey
    let publicKey = fs.readFileSync("./keys/public.pem", "utf8");

    const decrypt = crypto.publicDecrypt(
      {
        key: publicKey,
      },
      Buffer.from(signature, "base64")
    );

    if (decrypt.toString("base64") !== invoice.hash) {
      let data = {
        referenceNo: refId,
        signatureFromURL: signature,
        signatureFromDB: invoice.signature,
        hashFromDB: invoice.hash,
        decryptedHash: decrypt.toString("base64"),
      };

      return res
        .status(401)
        .json({ status: "401", message: "Invalid document", data: data });
    }

    let data = {
      referenceNo: refId,
      signatureFromURL: signature,
      signatureFromDB: invoice.signature,
      hashFromDB: invoice.hash,
      decryptedHash: decrypt.toString("base64"),
    };

    return res.status(201).json({
      status: "201",
      message: "Valid document",
      data: data,
    });
  } catch (err) {
    console.log(err.code);

    let data = {
      referenceNo: referenceNo,
      signatureFromURL: "invalid signature",
      signatureFromDB: "",
      hashFromDB: "invalid hash",
      decryptedHash: "",
    };

    if (err.code === "ERR_OSSL_RSA_INVALID_PADDING") {
      return res.status(500).json({
        status: "500",
        message: "Invalid Signature",
        data: data,
      });
    }

    return res.status(500).json({
      status: "500",
      message: "Something went wrong, please try again later",
      data: null,
    });
  }
};
