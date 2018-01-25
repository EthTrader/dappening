const UtilityLib = artifacts.require("./UtilityLib.sol");
const TokenDAO = artifacts.require("./TokenDAO.sol");
const Token = artifacts.require("./Token.sol");
const Registry = artifacts.require("./Registry.sol");
const Store = artifacts.require("./Store.sol");
const TokenFactory = artifacts.require("./TokenFactory.sol");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");

module.exports = function(deployer) {
  let tokenAddress, regAddress, storeAddress, daoAddress;
  deployer.deploy(UtilityLib)
    .then( () => deployer.link(UtilityLib, TokenDAO) )
    .then( () => deployer.deploy(TokenFactory) )
    .then( () => TokenFactory.deployed() )
    .then( tokenFactory => deployer.deploy(Token, tokenFactory.address, 0, 0, "EthTrader Token", 18, "ETR", false ) )
    .then( () => Token.deployed() )
    .then( token => tokenAddress = token.address )
    .then( () => deployer.deploy(Registry) )
    .then( () => Registry.deployed() )
    .then( registry => regAddress = registry.address )
    .then( () => deployer.deploy(Store, !["1","2","3","4","42"].includes(web3.version.network)) )
    .then( () => Store.deployed() )
    .then( store => storeAddress = store.address )
    .then( () => deployer.deploy(TokenDAO, 0, merkleRoot, tokenAddress, regAddress, storeAddress) )
    .then( () => TokenDAO.deployed() )
    .then( dao => daoAddress = dao.address )
    .then( () => Store.at(storeAddress).changeController(daoAddress) )
    .then( () => Token.at(tokenAddress).changeController(daoAddress) )
    .then( () => Registry.at(regAddress).changeController(daoAddress) );
};
