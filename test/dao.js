// const Registry = artifacts.require("./RedditRegistry.sol");
const TokenFactory = artifacts.require("./TokenFactory.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const Registry = artifacts.require("./Registry.sol");
const EthTraderDAO = artifacts.require("./EthTraderDAO.sol");
const EthTraderLib = artifacts.require("./EthTraderLib.sol");
const Store = artifacts.require("./Store.sol");
const utils = require("ethereumjs-util");
const { toBuffer, bufferToHex, setLengthLeft, setLengthRight } = utils;
// const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");
require('promise-log')(Promise);

const testUsername0 = "carlslarson";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
testData0.push(0);
const testUsername1 = "heliumcraft";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
testData1.push(1);
// console.log(testData1)

contract('EthTraderDAO', function(accounts) {
    let daoAddress;
    let storeAddress;
    let regAddress;
    let tokenAddress;

    it(`change store,token,registry owners to new dao`, () => {
        return Store.deployed()
            .then( store => {storeAddress = store.address; return TokenFactory.deployed();})
            .then( tokenFactory => MiniMeToken.new(tokenFactory.address, 0, 0, "EthTrader Token", 9, "ETR", false ) )
            .then( token => {tokenAddress = token.address; return Registry.deployed();})
            .then( reg => {regAddress = reg.address; return EthTraderDAO.new(0, merkleRoot, tokenAddress, regAddress, storeAddress);})
            .then( dao => daoAddress = dao.address )
            .then( () => Store.at(storeAddress).changeController(daoAddress) )
            .then( () => Store.at(storeAddress).controller() )
            .then( controller => assert.equal(controller, daoAddress, `dao is not the store controller`) )
            .then( () => Registry.at(regAddress).changeController(daoAddress) )
            .then( () => Registry.at(regAddress).controller() )
            .then( controller => assert.equal(controller, daoAddress, `dao is not the reg controller`) )
            .then( () => MiniMeToken.at(tokenAddress).changeController(daoAddress) )
            .then( () => MiniMeToken.at(tokenAddress).controller() )
            .then( controller => assert.equal(controller, daoAddress, `dao is not the token controller`) );
    });

    it(`merkle roots[0] matches ${merkleRoot}`, () => {
        return EthTraderDAO.at(daoAddress).roots.call(0)
            .then( root => assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`) );
    });

    it(`validate ${testUsername0} data`, () => {
        return EthTraderDAO.at(daoAddress).validate.call(...testData0)
            .then( res => assert.ok(res, `${testUsername0} failed merkle validation`) );
    });

    it(`${testUsername0} was registered`, () => {
        return EthTraderDAO.at(daoAddress).register(...testData0)
            .then( tx => EthTraderDAO.at(daoAddress).registry.call() )
            .then( address => Registry.at(address).getOwner.call(testUsername0) )
            .then( address => assert.equal(address, accounts[0], `${testUsername0} was not registered`) );
    });

    it(`${testUsername0} was endowed ${testData0[1]}`, () => {
      return EthTraderDAO.at(daoAddress).token.call()
        .then( address => MiniMeToken.at(address).balanceOf.call(accounts[0]) )
        .then( amount => assert.equal(amount.valueOf(), testData0[1], `${testUsername0} was not endowed ${testData0[1]}`) )
    });

    it(`token transfers are not enabled`, () => {
      return EthTraderDAO.at(daoAddress).token.call()
        .then( address => MiniMeToken.at(address).transfersEnabled.call() )
        .then( enabled => assert.equal(enabled, false, `token transfers were not disabled`) )
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

    it(`${testUsername0} initialised a prop:0`, () => {
        return EthTraderDAO.at(daoAddress).addProp("TOGGLE_TRANSFERABLE", 0)
            .then( () => EthTraderDAO.at(daoAddress).props.call(0) )
            .then( prop => assert.equal(prop.length, 7, `return data length mismatch`) );
    });

    it(`${testUsername0} weighted vote amount`, () => {
        return EthTraderDAO.at(daoAddress).getWeightedVote(testUsername0, 0)
            .log();
    });

    it(`${testUsername0} could vote:0`, () => {
        return EthTraderDAO.at(daoAddress).vote(0, 1)                                      // vote in favour
            .then( () => EthTraderDAO.at(daoAddress).props.call(0) )
            // .then( prop => assert.equal(prop[0], '0x4e4f4e4500000000000000000000000000000000', `token transfers were enabled`) );
    });

    it(`${testUsername0} enacted prop:0, tokens are transferable`, () => {
        return EthTraderDAO.at(daoAddress).enactProp(0)
            .then( () => EthTraderDAO.at(daoAddress).token.call() )
            .then( address => MiniMeToken.at(address).transfersEnabled.call() )
            .then( enabled => assert.equal(enabled, true, `token transfers were not enabled`) );
    });

    it(`${testUsername0} transfer 150 to ${testUsername1}`, () => {
        return EthTraderDAO.at(daoAddress).token.call()
            .then( address => MiniMeToken.at(address).transfer(accounts[1], 150) )
            .then( () => EthTraderDAO.at(daoAddress).token.call() )
            .then( address => MiniMeToken.at(address).balanceOf(accounts[1]) )
            .then( amount => assert.equal(amount.valueOf(), 150, `${testUsername1} did not receive 150`) );
    });

    it(`TOKEN_AGE_DAY_CAP is 200`, () => {
        return EthTraderDAO.at(daoAddress).store.call()
            .then( address => Store.at(address).values.call("TOKEN_AGE_DAY_CAP") )
            .then( amount => assert.equal(amount.valueOf(), 200, `TOKEN_AGE_DAY_CAP not 200`) );
    });

    it(`${testUsername0} initialised a prop:1`, () => {
        let propData = bufferToHex(Buffer.concat([
          setLengthRight(toBuffer("TOKEN_AGE_DAY_CAP"), 20),
          setLengthLeft(toBuffer(400), 12)
        ]));
        return EthTraderLib.deployed()
            .then( lib => lib.split32_20_12.call(propData) )
            .then( () => EthTraderDAO.at(daoAddress).addProp("SET_VALUE", propData) );
    });

    it(`${testUsername0} could vote:1`, () => {
        return EthTraderDAO.at(daoAddress).getWeightedVote(testUsername0, 1)
            .log()
            .then( () => EthTraderDAO.at(daoAddress).vote(1, 1) )                                      // vote in favour
    });

    it(`${testUsername0} enacted prop:1, TOKEN_AGE_DAY_CAP changed to 400`, () => {
        return EthTraderDAO.at(daoAddress).enactProp(1)
            .then( () => EthTraderDAO.at(daoAddress).store.call() )
            .then( address => Store.at(address).values.call("TOKEN_AGE_DAY_CAP") )
            .then( amount => assert.equal(amount.valueOf(), 400, `TOKEN_AGE_DAY_CAP not changed to 400`) );
    });

    const stake = 1000;
    it(`prop:2 fail loses ${stake} stake`, () => {
        let totalSupply;
        return EthTraderDAO.at(daoAddress).token.call()
            .then( address => MiniMeToken.at(address).totalSupply() )
            .then( amount => totalSupply = amount.valueOf() )
            .then( () => EthTraderDAO.at(daoAddress).addProp("ENDOW", 0) )
            .then( () => EthTraderDAO.at(daoAddress).getWeightedVote(testUsername0, 2) )
            .log()
            .then( () => EthTraderDAO.at(daoAddress).vote(2, 0) )
            .then( () => EthTraderDAO.at(daoAddress).enactProp(2) )
            .then( () => EthTraderDAO.at(daoAddress).token.call() )
            .then( address => MiniMeToken.at(address).totalSupply() )
            .then( amount => assert.equal(amount.valueOf(), totalSupply-stake, `totalSupply not reduced by ${stake}`) );
    });

    it(`prop:3 simple poll`, () => {
        return EthTraderDAO.at(daoAddress).addProp("NONE", 0)
            .then( () => EthTraderDAO.at(daoAddress).getWeightedVote(testUsername0, 3) )
            .log()
            .then( () => EthTraderDAO.at(daoAddress).vote(3, 7) )
            .then( () => EthTraderDAO.at(daoAddress).endPoll(3) )
            .then( () => EthTraderDAO.at(daoAddress).getResult(3, 7) )
            .log();
    });

    it(`prop:4 deploy new DAO and upgrade by vote`, () => {
        let newDAOAddress;
        return EthTraderDAO.new(0, 0, tokenAddress, regAddress, storeAddress)
            .then( instance => newDAOAddress = instance.address )
            .then( () => EthTraderDAO.at(daoAddress).addProp("UPGRADE", newDAOAddress) )
            .then( () => EthTraderDAO.at(daoAddress).getWeightedVote(testUsername0, 4) )
            .log()
            .then( () => EthTraderDAO.at(daoAddress).vote(4, 1) )
            .then( () => EthTraderDAO.at(daoAddress).enactProp(4) )
            .then( () => EthTraderDAO.at(daoAddress).registry.call() )
            .then( address => Registry.at(address).controller.call() )
            .then( address => assert.equal(address, newDAOAddress, `registry controller was not changed to new DAO address`) );
    });

});
