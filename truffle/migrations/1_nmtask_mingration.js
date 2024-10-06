const NeuromedTasks = artifacts.require("NeuromedTasks");
const NeuromedAccess = artifacts.require("NeuromedAccess");
const Hospital = artifacts.require("Hospital");

module.exports = function (deployer, network, accounts){
    // deployer.deploy(NeuromedAccess);
    // deployer.deploy(Hospital);
    deployer.deploy(NeuromedTasks);
};