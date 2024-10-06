const mongoose = require("mongoose");

// const URI =
//   "mongodb+srv://admin:vCYuwoBXszzK5DtO@cluster0.jg2mkou.mongodb.net/medi?retryWrites=true&w=majority";
// const URI = "mongodb://localhost:27017/medicare";
const URI =
  "mongodb+srv://admin:Kq9qq56dA6PhaYCR@cluster0.jg2mkou.mongodb.net/medi?retryWrites=true&w=majority";

const connect = async () => {
  await mongoose.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("database connected");
};

module.exports = connect;

// admin: BhGYoVvDScf7jtG6;
// mongodb+srv://admin:BhGYoVvDScf7jtG6@cluster0.jg2mkou.mongodb.net/?retryWrites=true&w=majority
// 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
// pm2 serve build --spa --name admin --port 3000
// pm2 start index.js --name "admin-server"
