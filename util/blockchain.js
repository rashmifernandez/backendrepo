const Web3 = require("web3");
const fs = require("fs");
const { sha256 } = require("js-sha256");

const provider = "https://goerli.infura.io/v3/4f953a856574493e93ad6666f2688a5c";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);

const NeuromedAccess = JSON.parse(
  fs.readFileSync("./truffle/build/contracts/NeuromedAccess.json")
);
const Hospital = JSON.parse(
  fs.readFileSync("./truffle/build/contracts/Hospital.json")
);
const NeuromedTasks = JSON.parse(
  fs.readFileSync("./truffle/build/contracts/NeuromedTasks.json")
);

async function createSuperAdmin(uid, walletId) {
  try {
    // let tt = await web3.eth.getCode(
    //   "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D"
    // );
    // console.log(tt);
    let mid = "0x".concat(sha256(uid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForContractOwner =
      "24a040f970ad793818f8940ee2ea2984e7c9502e3ed7f44426ec5ed364329ea0";

    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(keyForContractOwner);

    const contract = new web3.eth.Contract(NeuromedAccess.abi, address);

    const tx = contract.methods.addUser(
      mid,
      "0xc853308605851716aebf9b8085de39c1c4ef8de095a393b3a950e2fb1686bf83", // role
      walletId, // walletId
      "0x39349db958ca58bbd5da126bd654d05d8d0c93f86805918f236dc076194e1955" // nohs
    );

    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForContractOwner
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}
async function createHospital(hid) {
  try {
    // let tt = await web3.eth.getCode(
    //   "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D"
    // );
    // console.log(tt);
    let hospitalId = "0x".concat(sha256(hid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForNeuromed =
      "0dd528d04f08c54208093a9413addc34c350adb081199135bd10c1a552ba321f";

    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(keyForNeuromed);

    const contract = new web3.eth.Contract(Hospital.abi, address);

    console.log(contract.methods);
    const tx = contract.methods.addHospital(hospitalId);

    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForNeuromed
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function createAdmin(uid, walletId, role, hid) {
  try {
    // let tt = await web3.eth.getCode(
    //   "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D"
    // );
    // console.log(tt);
    let mid = "0x".concat(sha256(uid));
    let hospitalId = "0x".concat(sha256(hid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForNeuromed =
      "0dd528d04f08c54208093a9413addc34c350adb081199135bd10c1a552ba321f";

    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(keyForNeuromed);

    const contract = new web3.eth.Contract(NeuromedAccess.abi, address);

    const tx = contract.methods.addUser(
      mid,
      role, // role
      walletId, // walletId
      hospitalId // hid
    );

    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForNeuromed
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function createStaff(uid, walletId, role, hid) {
  try {
    // let tt = await web3.eth.getCode(
    //   "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D"
    // );
    // console.log(tt);
    let mid = "0x".concat(sha256(uid));
    let hospitalId = "0x".concat(sha256(hid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForHAdmin =
      "12c4ac4c6fd013f52d73f68e4b6a51b5841ffb94f2dbf906d3468e6c11dd285d";
    // const keyForHAdmin =
    //   "b648b4664bc980a8a38f443688975d68276d0cf660ee11a9d97216681ed53c86";

    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(keyForHAdmin);

    const contract = new web3.eth.Contract(NeuromedAccess.abi, address);

    const tx = contract.methods.addUser(
      mid,
      role, // role
      walletId, // walletId
      "0x39349db958ca58bbd5da126bd654d05d8d0c93f86805918f236dc076194e1955" // hid
    );

    console.log(signer.address);
    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForHAdmin
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function storeUser(uid, nic, hash) {
  try {
    let mid = "0x".concat(sha256(uid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForMrep =
      "9b925d6d0ae035411f7a0a89d869661892bc1e5cb183fcaacf6f6e1821592478";

    const signer = web3.eth.accounts.privateKeyToAccount(keyForMrep);
    const contract = new web3.eth.Contract(NeuromedTasks.abi, address);

    const tx = contract.methods.registerPatient(mid, nic, hash);

    console.log(signer.address);
    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForMrep
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function addLabReport(lid, hash, pid) {
  try {
    console.log(lid, hash, pid);

    let patientId = "0x".concat(sha256(pid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForLass =
      "6b9567c5e7247c17fe0bbb3d52846f84b6e47208ed1ec3644293fdadd81b2773";

    const signer = web3.eth.accounts.privateKeyToAccount(keyForLass);
    const contract = new web3.eth.Contract(NeuromedTasks.abi, address);

    const tx = contract.methods.addLabReport(
      "0x".concat(sha256(lid)),
      String(hash),
      patientId
    );

    console.log(signer.address);
    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForLass
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function getLabReport(pid) {
  try {
    let patientId = "0x".concat(sha256(pid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForLass =
      "6b9567c5e7247c17fe0bbb3d52846f84b6e47208ed1ec3644293fdadd81b2773";

    const signer = web3.eth.accounts.privateKeyToAccount(keyForLass);
    const contract = new web3.eth.Contract(NeuromedTasks.abi, address);

    const tx = contract.methods.getLabRepsForPatient(patientId);

    const receipt = await tx.call({
      from: signer.address,
      gas: await tx.estimateGas({ from: signer.address }),
    });
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function addMedicalReport(rid, status, hash, pid) {
  try {
    let patientId = "0x".concat(sha256(pid));
    let reportId = "0x".concat(sha256(rid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForDoc =
      "097545bc6ef0f04239c85b95398532603a56bf8ccc0013f784933b010cd08e75";

    const signer = web3.eth.accounts.privateKeyToAccount(keyForDoc);
    const contract = new web3.eth.Contract(NeuromedTasks.abi, address);

    const tx = contract.methods.addMedicalrecord(
      reportId,
      status,
      String(hash),
      patientId
    );

    console.log(signer.address);
    const data = tx.encodeABI();
    const gas = await tx.estimateGas({ from: signer.address });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: address,
        data,
        gas,
        gasPrice,
      },
      keyForDoc
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

async function getMedicalReport(pid) {
  try {
    let patientId = "0x".concat(sha256(pid));
    const address = "0x1B2b7b3D9989B4f65d1cdb47839d62c25FFaE64D";
    const keyForDoc =
      "097545bc6ef0f04239c85b95398532603a56bf8ccc0013f784933b010cd08e75";

    const signer = web3.eth.accounts.privateKeyToAccount(keyForDoc);
    const contract = new web3.eth.Contract(NeuromedTasks.abi, address);

    const tx = contract.methods.getMedRecsForPatient(patientId);

    const receipt = await tx.call({
      from: signer.address,
      gas: await tx.estimateGas({ from: signer.address }),
    });
    return receipt;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  createSuperAdmin,
  createAdmin,
  createHospital,
  createStaff,
  storeUser,
  addLabReport,
  getLabReport,
  addMedicalReport,
  getMedicalReport,
};
