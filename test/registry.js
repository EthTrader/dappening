const Registry = artifacts.require("./RedditRegistry.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/root.json");
const modDayRate = require("../out/modDayRate.json");
const calcEndowment = require("../calcEndowment");

const testUsername = "carlslarson";
const testData = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername)];
const testEndowment = calcEndowment(testData);

contract('Registry', function(accounts) {
  console.log(accounts)
  console.log(testData)
  console.log(testEndowment)

  it(`merkle root matches ${merkleRoot}`, () => {
    Registry.deployed()
        .then( reg => reg.root.call() )
        .then( root => assert.equal(root, merkleRoot, `merkle root doesn't match (${root} vs ${merkleRoot})`) );
  });

  it(`check ${testUsername} data`, () => {
    Registry.deployed()
      .then( reg => reg.check.call(...testData) )
      .then( res => assert.ok(res[0], `${testUsername} failed merkle validation`) );
  });

  it(`${testUsername} was registered`, () => {
    let reg;
    Registry.deployed()
      .then( r => reg = r)
      .then( () => reg.register(...testData) )
      .then( () => reg.usernameToIdx.call(testUsername) )
      .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername} was not register at userIdx:1`) );
  });

  it(`${testUsername} was endowed ${testEndowment}`, () => {
    let reg;
    Registry.deployed()
      .then( r => reg = r)
      .then( () => reg.token.call() )
      .then( tokenAddress => MiniMeToken.at(tokenAddress).balanceOf.call(accounts[0]) )
      .then( amount => {console.log(amount.valueOf()); return amount})
      .then( amount => assert.equal(amount.valueOf(), testEndowment, `${testUsername} was not endowed ${testEndowment}`) )
  });
});
