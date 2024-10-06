const AWS = require("aws-sdk");
const {
  RekognitionClient,
  CompareFacesCommand,
} = require("@aws-sdk/client-rekognition");

//AWS access details
AWS.config.update({
  accessKeyId: "AKIASXRHN67N26TJBC5T",
  secretAccessKey: "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",
  region: "us-east-1",
});

const client = new AWS.Rekognition();
// const client = new AWS.Rekognition();

const checkKYC = async (photo_source, photo_target) => {
  const params = {
    SourceImage: {
      S3Object: {
        Bucket: "patientkyc",
        Name: photo_source,
      },
    },
    TargetImage: {
      S3Object: {
        Bucket: "patientkyc",
        Name: photo_target,
      },
    },
    SimilarityThreshold: 70,
  };

  // console.log(params);

  let x = false;
  let Output = "";

  client.compareFaces(params, function (err, response) {
    if (err) {
      console.log(err, err.stack, "error"); // an error occurred
    } else {
      response.FaceMatches.forEach((data) => {
        x = true;
        let position = data.Face.BoundingBox;
        let similarity = data.Similarity;
        Output =
          "Face Recognition Sucessfull With A Percentage of " +
          similarity +
          "%";
        console.log(Output);
        return Output;
      }); // for response.faceDetails
      if (x == false) {
        Output = "Face Recognition Fail";
        console.log(Output);

        return Output;
      }
    } // if
  });
};

exports.checkKYC = checkKYC;
