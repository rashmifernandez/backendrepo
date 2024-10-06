const { assert } = require("chai");
const nmtask_test = artifacts.require("NeuromedTasks.sol");

const NM_ADMIN =
  "0xc853308605851716aebf9b8085de39c1c4ef8de095a393b3a950e2fb1686bf83";
const HS_ADMIN =
  "0x8422142255c844d3d4a5104b709d1da65e3e4b88bc607f47279dd1baf7acc808";
const MREP =
  "0xc2af34e7cc1f3d8808f569d6d46a95c4217b618edefc26d793e3a6c23dfe262f";
const DOCTOR =
  "0xc9c8e67a61d2e7371df46522b44051b955c16bf4b713ef44e1373b25bfcd80b2";
const LAB_ASST =
  "0xfff7b8e4ac10566d090c9cdfc71d80fcc431b76ce09edaddaa421288a053208a";

const NO_HS =
  "0x39349db958ca58bbd5da126bd654d05d8d0c93f86805918f236dc076194e1955";

const nm_admin_1 =
  "0xadbb96672f1576274d3a2c22ea1c7cb89a8652ef38928354b9094cbf3f630444";
const hospital1 =
  "0x55bc4d78fb37ef8b3e5359604ed6e1c29c519772913539d34b3459053243b010";
const hs_admin1 =
  "0xfce6a49463ea673d796dc63cfdc2b0a4220078f0758938d415598a1081c01221";
const mrep1 =
  "0x71078e36bd233841d679745f0c5ba5b2e52d2c911ea90e712be31c2d88397911";
const doctor1 =
  "0x428e31c91cbf8c2d27a757945b0d58dbdc80f122dcc07993b4713084dd4a5cd7";
const lab_asst1 =
  "0xe96ba5edebf91ca5da44c282462f2bf93d299683da522ab3f5aaba117dd64e14";

const patient1 = {
  id: "0x31c8970f143ee104f88b4f7c9ebb4858443cb4923630e16afcd071592821d630",
  nic: "991887889v",
  token_uri:
    "https://gateway.pinata.cloud/ipfs/QmVNk7fGHso6mrfV4mptBCJAqXMj7nzHYYnGC3D4vKY3z4",
};

const patient2 = {
  id: "0xbb29706f9f23462935a11cc8d8c12a48265169ea59af7c552711bfad3d54a347",
  nic: "991887555v",
  token_uri:
    "https://gateway.pinata.cloud/ipfs/QmVNk7fGHso6yy6V4mptBCJAqXMj7nzHYYnGC3D4vKY3z4",
};

const mrec1 = {
  id: "0xea64cacf1c5f09f1e946773b8d3ef66136166db1b3db1e58ff0c47c15244cf11",
  iscritical: false,
  token_uri:
    "https://gateway.pinata.cloud/ipfs/QmVNk7fGHso6mrfV4mptBCJAqXMj7nzHYYnGC3D4vKY3z4",
};

const mrec2 = {
  id: "0xc9e4396b5933719bb694c13e8f2419a4e6ed3dc71fae864efb7fcebf0212b2e9",
  iscritical: true,
  token_uri:
    "https://gateway.pinata.cloud/ipfs/QmVNk7fGHso6mrfV4mptBCJAqXMj7nzHYYnGC3D4vKY3z4",
};

const lrep1 = {
  id: "0xa163bcde125fee9ce939cb353a0bb6f25d4bb102eb4bf05075829dae22ce6a71",
  token_uri:
    "https://gateway.pinata.cloud/ipfs/QmVNk7fGHso6mrfV4mptBCJAqXMj7nzHYYnGC3D4vKY3z4",
};

contract("NeuroMed Testing: ", (accounts) => {
  let nmtask_test_contract = null;

  before(async () => {
    nmtask_test_contract = await nmtask_test.deployed();
  });

  it("NeuroMed Admin added by the Contract Owner", async () => {
    const result = await nmtask_test_contract.addUser(
      nm_admin_1,
      NM_ADMIN,
      accounts[1],
      NO_HS
    );
    assert.equal(result.logs[1].event, "UserAdded");
  });

  it("Hospital added by the NeuroMed Admin", async () => {
    const result = await nmtask_test_contract.addHospital(hospital1, {
      from: accounts[1],
    });
    assert.equal(result.logs[0].event, "HospitalAdded");
  });

  it("Hospital Admin added by the NeuroMed Admin", async () => {
    const result = await nmtask_test_contract.addUser(
      hs_admin1,
      HS_ADMIN,
      accounts[2],
      hospital1,
      { from: accounts[1] }
    );
    assert.equal(result.logs[1].event, "UserAdded");
  });

  it("Medical Rep added by the NeuroMed Admin", async () => {
    const result = await nmtask_test_contract.addUser(
      mrep1,
      MREP,
      accounts[3],
      NO_HS,
      { from: accounts[1] }
    );
    assert.equal(result.logs[1].event, "UserAdded");
  });

  it("Doctor added by the NeuroMed Admin", async () => {
    const result = await nmtask_test_contract.addUser(
      doctor1,
      DOCTOR,
      accounts[4],
      NO_HS,
      { from: accounts[1] }
    );
    assert.equal(result.logs[1].event, "UserAdded");
  });

  it("Lab Assistant added by the Hospital Admin", async () => {
    const result = await nmtask_test_contract.addUser(
      lab_asst1,
      LAB_ASST,
      accounts[5],
      NO_HS,
      { from: accounts[2] }
    );
    assert.equal(result.logs[1].event, "UserAdded");
  });

  it("Patient1 added by the Medical Rep", async () => {
    const result = await nmtask_test_contract.registerPatient(
      patient1.id,
      patient1.nic,
      patient1.token_uri,
      { from: accounts[3] }
    );
    assert.equal(result.logs[1].event, "PatientAdded");
  });

  it("Patient2 added by the Medical Rep", async () => {
    const result = await nmtask_test_contract.registerPatient(
      patient2.id,
      patient2.nic,
      patient2.token_uri,
      { from: accounts[3] }
    );
    assert.equal(result.logs[1].event, "PatientAdded");
  });

  it("Medical Record (non-critical) added by the Doctor", async () => {
    const result = await nmtask_test_contract.addMedicalrecord(
      mrec1.id,
      mrec1.iscritical,
      mrec1.token_uri,
      patient1.id,
      { from: accounts[4] }
    );
    assert.equal(result.logs[1].event, "MedRecAdded");
  });

  it("Medical Record (critical) added by the Doctor", async () => {
    const result = await nmtask_test_contract.addMedicalrecord(
      mrec2.id,
      mrec2.iscritical,
      mrec2.token_uri,
      patient1.id,
      { from: accounts[4] }
    );
    assert.equal(result.logs[1].event, "MedRecAdded");
  });

  it("Lab Report added by the Lab Assistant", async () => {
    const result = await nmtask_test_contract.addLabReport(
      lrep1.id,
      lrep1.token_uri,
      patient1.id,
      { from: accounts[5] }
    );
    assert.equal(result.logs[1].event, "LabRepAdded");
  });
});
