// const Registry = artifacts.require("./RedditRegistry.sol");
const MerkleTreeLib = artifacts.require("./MerkleTreeLib.sol");
const Registry = artifacts.require("./Registry.sol");
// const RegReader = artifacts.require("./RegReader.sol");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");

module.exports = function(deployer) {
  deployer.deploy(MerkleTreeLib);
  // deployer.link(MerkleTreeLib, Registry);
  // deployer.deploy(Registry, merkleRoot, modDayRate, 4);
  deployer.link(MerkleTreeLib, Registry);
  deployer.deploy(Registry, merkleRoot, 4);
  // deployer.link(Registry, RegReader);
};
