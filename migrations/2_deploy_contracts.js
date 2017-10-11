const Registry = artifacts.require("./RedditRegistry.sol");
const MerkleTreeLib = artifacts.require("./MerkleTreeLib.sol");

module.exports = function(deployer) {
  deployer.deploy(MerkleTreeLib);
  deployer.link(MerkleTreeLib, Registry);
  deployer.deploy(Registry);
};
