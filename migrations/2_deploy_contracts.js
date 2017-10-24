const MerkleTreeLib = artifacts.require("./MerkleTreeLib.sol");
const EthTraderDAO = artifacts.require("./EthTraderDAO.sol");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");

module.exports = function(deployer) {
  deployer.deploy(MerkleTreeLib);
  deployer.link(MerkleTreeLib, EthTraderDAO);
  deployer.deploy(EthTraderDAO, 0, merkleRoot, true);
};
