const Registry = artifacts.require("./RedditRegistry.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");
const userRegInputs = require("../out/userRegInputs.json");

const testUsername = "carlslarson";
const testUserInputDataIdx = userRegInputs.length-1;

contract('Registry', function(accounts) {
  console.log(accounts)
  console.log(userRegInputs[testUserInputDataIdx])
  it(`check ${testUsername} data`, () => {
    Registry.deployed()
      .then( reg => reg.check.call(...userRegInputs[testUserInputDataIdx]) );
    //   .then( ret => console.log(ret.valueOf()) )
          // .then( tuple => console.log(tuple., tuple[0], tuple[1]) )
  });
  it(`${testUsername} was registered`, () => {
    let reg;
    Registry.deployed()
      .then( r => reg = r)
      .then( () => reg.register(...userRegInputs[testUserInputDataIdx]) )
    //   .then( tx => console.log(tx) )
      .then( () => reg.usernameToIdx.call(testUsername) )
      .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername} was not register at userIdx:1`) )
      // .then( ret => {console.log(ret.valueOf());return ret;})
      // .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername} was not register at userIdx:1`) )
  });
  it(`${testUsername} was endowed`, () => {
    let reg;
    Registry.deployed()
      .then( r => reg = r)
      .then( () => reg.token() )
      .then( token => MiniMeToken.at(token).balanceOf(accounts[0]))
      .then( amount => console.log(amount.valueOf()) );
    //   .then( amount => assert.equal(amount.valueOf(), 1000, `${testUsername} was not endowed 1000`) )
      // .then( ret => {console.log(ret.valueOf());return ret;})
      // .then( idx => assert.equal(idx.valueOf(), 1, `${testUsername} was not register at userIdx:1`) )
  });
});
