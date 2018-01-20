const EthTraderLib = artifacts.require("./EthTraderLib.sol");
const EthTraderDAO = artifacts.require("./EthTraderDAO.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const Registry = artifacts.require("./Registry.sol");
const Store = artifacts.require("./Store.sol");
const TokenFactory = artifacts.require("./TokenFactory.sol");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");

module.exports = function(deployer) {
  let tokenAddress, regAddress, storeAddress, daoAddress;
  deployer.deploy(EthTraderLib)
    .then( () => deployer.link(EthTraderLib, EthTraderDAO) )
    .then( () => deployer.deploy(TokenFactory) )
    .then( () => TokenFactory.deployed() )
    .then( tokenFactory => deployer.deploy(MiniMeToken, tokenFactory.address, 0, 0, "EthTrader Token", 18, "ETR", false ) )
    .then( () => MiniMeToken.deployed() )
    .then( token => tokenAddress = token.address )
    .then( () => deployer.deploy(Registry) )
    .then( () => Registry.deployed() )
    .then( registry => regAddress = registry.address )
    .then( () => deployer.deploy(Store, !["1","2","3","4","42"].includes(web3.version.network)) )
    .then( () => Store.deployed() )
    .then( store => storeAddress = store.address )
    .then( () => deployer.deploy(EthTraderDAO, 0, merkleRoot, tokenAddress, regAddress, storeAddress) )
    .then( () => EthTraderDAO.deployed() )
    .then( dao => daoAddress = dao.address )
    .then( () => Store.at(storeAddress).changeController(daoAddress) )
    .then( () => MiniMeToken.at(tokenAddress).changeController(daoAddress) )
    .then( () => Registry.at(regAddress).changeController(daoAddress) );
};
