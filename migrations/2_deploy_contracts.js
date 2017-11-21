// const MerkleTreeLib = artifacts.require("./MerkleTreeLib.sol");
const EthTraderLib = artifacts.require("./EthTraderLib.sol");
const EthTraderDAO = artifacts.require("./EthTraderDAO.sol");
// const Controlled = artifacts.require("./Controlled.sol");
// const MiniMeToken = artifacts.require("./MiniMeToken.sol");
// const Voting = artifacts.require("./Voting.sol");
const Registry = artifacts.require("./Registry.sol");
const Store = artifacts.require("./Store.sol");
const TokenFactory = artifacts.require("./TokenFactory.sol");
// const TokenController = artifacts.require("./TokenController.sol");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");

module.exports = function(deployer) {
  // deployer.deploy(Controlled);
  // deployer.deploy(TokenController);
  deployer.deploy(TokenFactory);
  deployer.deploy(Registry);
  deployer.deploy(Store, true);
  deployer.deploy(EthTraderLib);
  deployer.link(EthTraderLib, EthTraderDAO);
  // deployer.deploy(EthTraderDAO, 0, merkleRoot, true);
};
