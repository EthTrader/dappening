// const Registry = artifacts.require("./RedditRegistry.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const Registry = artifacts.require("./Registry.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/root.json");
const modDayRate = require("../out/modDayRate.json");
const calcEndowment = require("../calcEndowment");
require('promise-log')(Promise);

const testUsername = "carlslarson";
const testData = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername)];
const testEndowment = calcEndowment(testData);

console.log(testData);

contract('Registry', function(accounts) {
    it(`merkle root matches ${merkleRoot}`, () => {
      return Registry.deployed()
          .then( registry => registry.root.call() )
          .then( root => assert.equal(root, merkleRoot, `merkle root doesn't match (${root} vs ${merkleRoot})`) );
    });

    it(`check ${testUsername} data`, () => {
      return Registry.deployed()
        .then( registry => registry.check.call(...testData) )
        .then( res => assert.ok(res[0], `${testUsername} failed merkle validation`) );
    });

    it(`${testUsername} was registered`, () => {
      return Registry.deployed()
        .then( registry => registry.register(...testData))
        .then( tx => Registry.deployed() )
        .then( registry => registry.usernameToIdx.call(testUsername) )
        .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername} was not register at userIdx:1`) );
    });

    it(`${testUsername} was endowed ${testEndowment}`, () => {
      return Registry.deployed()
        .then( registry => registry.token.call() )
        .then( address => MiniMeToken.at(address).balanceOf.call(accounts[0]) )
        .then( amount => assert.equal(amount.valueOf(), testEndowment, `${testUsername} was not endowed ${testEndowment}`) )
    });

    it(`token transfers are not enabled`, () => {
      return Registry.deployed()
        .then( registry => registry.token.call() )
        .then( address => MiniMeToken.at(address).transfersEnabled.call() )
        .then( enabled => assert.equal(enabled, false, `token transfers were enabled`) )
    });

});
