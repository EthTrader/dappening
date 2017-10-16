// const Registry = artifacts.require("./RedditRegistry.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const Registry = artifacts.require("./Registry.sol");
const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/root.json");
const modDayRate = require("../out/modDayRate.json");
const calcEndowment = require("../calcEndowment");
require('promise-log')(Promise);

const testUsername0 = "carlslarson";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
const testEndowment = calcEndowment(testData0);
testData0.push(0);
const testUsername1 = "MrKup";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
testData1.push(1);
console.log(testData1)

contract('Registry', function(accounts) {
    console.log(accounts);
    it(`merkle roots[0] matches ${merkleRoot}`, () => {
        return Registry.deployed()
            .then( registry => registry.roots.call(0) )
            .then( root => assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`) );
    });

    it(`check ${testUsername0} data`, () => {
        return Registry.deployed()
            .then( registry => registry.check.call(...testData0) )
            .then( res => assert.ok(res[0], `${testUsername0} failed merkle validation`) );
    });

    it(`${testUsername0} was registered`, () => {
        return Registry.deployed()
            .then( registry => registry.register(...testData0) )
            .then( tx => Registry.deployed() )
            .then( registry => registry.usernameToIndex.call(testUsername0) )
            .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername0} was not registered@1`) );
    });

    it(`${testUsername0} was endowed ${testEndowment}`, () => {
      return Registry.deployed()
        .then( registry => registry.token.call() )
        .then( address => MiniMeToken.at(address).balanceOf.call(accounts[0]) )
        .then( amount => assert.equal(amount.valueOf(), testEndowment, `${testUsername0} was not endowed ${testEndowment}`) )
    });

    it(`token transfers are not enabled`, () => {
      return Registry.deployed()
        .then( registry => registry.token.call() )
        .then( address => MiniMeToken.at(address).transfersEnabled.call() )
        .then( enabled => assert.equal(enabled, false, `token transfers were enabled`) )
    });

    it(`${testUsername1} was registered@2 with new merkle root@1`, () => {
        return Registry.deployed()
            .then( registry => registry.addRoot(merkleRoot) )
            .then( () => Registry.deployed() )
            .then( registry => registry.roots.call(1) )
            .then( root => assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`) )
            .then( tx => Registry.deployed() )
            .then( registry => registry.register(...testData1, {from: accounts[1]}) )
            .then( tx => Registry.deployed() )
            .then( registry => registry.usernameToIndex.call(testUsername1) )
            .then( idx => assert.equal(idx.valueOf(), 2, `${testUsername1} was not registered@2`) );
    });

    it(`use regreader to get user data`, () => {
        return Registry.deployed()
            .then( registry => RegReader.new(registry.address) )
            .then( reader => reader.getUserByUsername.call(testUsername0) )
            .then( user => assert.equal(user[2].valueOf(), testData0[1], `${testUsername0} start date was not ${testData0[1]}`) );
    });

});
