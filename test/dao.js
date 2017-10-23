// const Registry = artifacts.require("./RedditRegistry.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const Registry = artifacts.require("./Registry.sol");
const EthTraderDAO = artifacts.require("./EthTraderDAO.sol");
// const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");
require('promise-log')(Promise);

const testUsername0 = "carlslarson";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
testData0.push(0);
const testUsername1 = "MrKup";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
testData1.push(1);
console.log(testData1)

contract('EthTraderDAO', function(accounts) {
    console.log(accounts);
    it(`merkle roots[0] matches ${merkleRoot}`, () => {
        return EthTraderDAO.deployed()
            .then( dao => dao.roots.call(0) )
            .then( root => assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`) );
    });

    it(`validate ${testUsername0} data`, () => {
        return EthTraderDAO.deployed()
            .then( dao => dao.validate.call(...testData0) )
            .then( res => assert.ok(res, `${testUsername0} failed merkle validation`) );
    });

    it(`${testUsername0} was registered`, () => {
        return EthTraderDAO.deployed()
            .then( dao => dao.register(...testData0) )
            .then( tx => EthTraderDAO.deployed() )
            .then( dao => dao.registry.call() )
            .then( address => Registry.at(address).getOwner.call(testUsername0) )
            .then( address => assert.equal(address, accounts[0], `${testUsername0} was not registered`) );
    });

    it(`${testUsername0} was endowed ${testData0[1]}`, () => {
      return EthTraderDAO.deployed()
        .then( dao => dao.token.call() )
        .then( address => MiniMeToken.at(address).balanceOf.call(accounts[0]) )
        .then( amount => assert.equal(amount.valueOf(), testData0[1], `${testUsername0} was not endowed ${testData0[1]}`) )
    });

    it(`token transfers are not enabled`, () => {
      return EthTraderDAO.deployed()
        .then( dao => dao.token.call() )
        .then( address => MiniMeToken.at(address).transfersEnabled.call() )
        .then( enabled => assert.equal(enabled, false, `token transfers were enabled`) )
    });

    // it(`${testUsername1} was registered@2 with new merkle root@1`, () => {
    //     return EthTraderDAO.deployed()
    //         .then( dao => dao.addRoot(merkleRoot) )
    //         .then( () => EthTraderDAO.deployed() )
    //         .then( dao => dao.roots.call(1) )
    //         .then( root => assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`) )
    //         .then( tx => EthTraderDAO.deployed() )
    //         .then( dao => dao.register(...testData1, {from: accounts[1]}) )
    //         .then( tx => Registry.deployed() )
    //         .then( registry => registry.usernameToAddress.call(testUsername1) )
    //         .then( address => assert.equal(address, accounts[1], `${testUsername1} was not registered@2`) );
    // });

    it(`${testUsername0} initialised a vote@0`, () => {
        return EthTraderDAO.deployed()
            .then( dao => dao.addProp("NONE", 0) )
            .then( () => EthTraderDAO.deployed() )
            .then( dao => dao.props.call(0) )
            .then( prop => assert.equal(prop.length, 7, `token transfers were enabled`) );
    });

    it(`${testUsername0} could vote@0`, () => {
        return EthTraderDAO.deployed()
            .then( dao => dao.vote(0, 1) )          // vote in favour
            .then( () => EthTraderDAO.deployed() )
            .then( dao => dao.props.call(0) )
            .then( prop => assert.equal(prop[0], '0x4e4f4e4500000000000000000000000000000000', `token transfers were enabled`) );
    });

});
