const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Jimp = require("jimp");

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

const s3 = new S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function uploadFileWithRotate(file, rotatedFileName) {
  // rotate(`./uploads/${file.filename}`, `./uploads/${rotatedFileName}`);
  // console.log(`Image ./uploads/${file.filename} rotated`);

  const image = await Jimp.read(`./uploads/${file.filename}`);
  image.rotate(90);
  await image.writeAsync(`./uploads/${rotatedFileName}`);

  // await new Promise((r) => setTimeout(r, 2000));

  const fileStream = fs.createReadStream(`./uploads/${rotatedFileName}`);

  // const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: fileStream,
    Key: rotatedFileName,
  };

  return s3.upload(uploadParams).promise();
}

async function uploadFileWithoutRotate(file) {
  const fileStream = fs.createReadStream(file.path);

  console.log(file, "from s3");
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  return s3.getObject(downloadParams).createReadStream();
}

function getFileStream1(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  return s3
    .headObject(downloadParams)
    .promise()
    .then(() => {
      // This will not throw error anymore
      console.log("exists");
      return s3.getObject(downloadParams).createReadStream();
    })
    .catch((error) => {
      if (error.statusCode === 404) {
        // Catching NoSuchKey
      }
    });
}

module.exports = {
  getFileStream,
  getFileStream1,
  uploadFileWithoutRotate,
  uploadFileWithRotate,
};
