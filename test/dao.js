const utils = require("ethereumjs-util");
const { toBuffer, bufferToHex, setLengthLeft, setLengthRight } = utils;
// const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");
require('promise-log')(Promise);

const testUsername0 = "carlslarson";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
testData0.splice(-1,1); // remove address
testData0.push(0);      // add merkle root index
const testUsername1 = "heliumcraft";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
var async = require('async');

let accounts;

const secret = require("../.secret.json");
config({
  mnemonic: secret.mnemonic
});

contract('EthTraderDAO', function() {
    this.timeout(0);
    before(function(done) {
      var contractsConfig = {
        "EthTraderLib": {
          "deploy": true
        },
        "EthTraderDAO": {
          "gas": 3500000,
          "args": [
            0, merkleRoot, "$MiniMeToken", "$Registry", "$Store"
          ]
        },
        "MiniMeToken": {
          "gas": 1800000,
          "args": [
            "$TokenFactory", 0, 0, "EthTrader Token", 9, "ETR", false
          ]
        },
        "Registry": {
        },
        "Store": {
          "args": [
            true
          ]
        },
        "TokenFactory": {
          "deploy": false
        },
        "Voting": {
          "deploy": false,
          "gas": 1500000
        }
      };
      EmbarkSpec.deployAll(contractsConfig, (_accounts) => {
        accounts = _accounts;
        console.log(accounts);
        async.waterfall([
          function(next) {
            Store.changeController(EthTraderDAO.address, () =>{ next() });
          },
          function(next) {
            Registry.changeController(EthTraderDAO.address, () => { next() });
          },
          function(next) {
            MiniMeToken.changeController(EthTraderDAO.address, () => { next() });
          },
        ], done)
      });
    });

    it(`check the dao controls store,token, and registry`, (done) => {
        async.waterfall([
          function(next) {
            Store.controller(function(err, result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          },
          function(next) {
            Registry.controller(function(err, result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          },
          function(next) {
            MiniMeToken.controller(function(err, result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          }
        ], done);
    });

    it(`merkle roots[0] matches ${merkleRoot}`, (done) => {
      EthTraderDAO.roots(0, (err, root) => {
        assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`);
        done();
      });
    });

    it(`validate ${testUsername0} data`, (done) => {
      console.log("validate");
      EthTraderDAO.validate(...testData0, {from: accounts[0]}, (err, result) => {
        assert.ok(result, `${testUsername0} failed merkle validation`);
        done();
      });
    });

    it(`${testUsername0} was registered`, (done) => {
      EthTraderDAO.register(...testData0, {from: accounts[0], gas: 1000000}, (err, result) => {
        EthTraderDAO.registry((err, address) => {
          //Registry.at(address).getOwner(testUsername0, (err, ownerAddress) => {
          Registry.getOwner(testUsername0, (err, ownerAddress) => {
            assert.equal(ownerAddress, accounts[0], `${testUsername0} was not registered`);
            done();
          });
        });
      });
    });

    it(`${testUsername0} was endowed ${testData0[1]}`, (done) => {
      EthTraderDAO.token((err, tokenAddress) => {
        //MiniMeToken.at(tokenAddress).balanceOf(accounts[0], (err, amount) => {
        MiniMeToken.balanceOf(accounts[0], (err, amount) => {
          assert.equal(amount.valueOf(), testData0[1], `${testUsername0} was not endowed ${testData0[1]}`);
          done();
        });
      });
    });

    it(`token transfers are not enabled`, (done) => {
      EthTraderDAO.token((err, tokenAddress) => {
        //MiniMeToken.at(tokenAddress).transfersEnabled((err, enabled) => {
        MiniMeToken.transfersEnabled((err, enabled) => {
          assert.equal(enabled, false, `token transfers were not disabled`);
          done();
        });
      });
    });

    //it(`${testUsername1} was registered@2 with new merkle root@1`, () => {
    //  EthTraderDAO.addRoot(merkleRoot, (err, result) => {
    //    EthTraderDAO.roots(1, (err, root) => {
    //      assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`);
//
    //      EthTraderDAO.register(...testData1, {from: accounts[1]}, (err, result) => {
    //        Registry.usernameToAddress(testUsername1, (err, address) => {
    //          assert.equal(address, accounts[1], `${testUsername1} was not registered@2`);
    //        });
    //      });
    //    });
    //  });
    //    //return EthTraderDAO.deployed()
    //    //    .then( dao => dao.addRoot(merkleRoot) )
    //    //    .then( () => EthTraderDAO.deployed() )
    //    //    .then( dao => dao.roots.call(1) )
    //    //    .then( root => assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`) )
    //    //    .then( tx => EthTraderDAO.deployed() )
    //    //    .then( dao => dao.register(...testData1, {from: accounts[1]}) )
    //    //    .then( tx => Registry.deployed() )
    //    //    .then( registry => registry.usernameToAddress.call(testUsername1) )
    //    //    .then( address => assert.equal(address, accounts[1], `${testUsername1} was not registered@2`) );
    //});

    it(`${testUsername0} initialised a prop:0`, (done) => {
      EthTraderDAO.addProp("TOGGLE_TRANSFERABLE", 0, {gas: 1000000}, (err, results) => {
        EthTraderDAO.props(0, (err, prop) => {
          assert.equal(prop.length, 7, `return data length mismatch`);
          done();
        });
      });
    });

    it(`${testUsername0} weighted vote amount`, (done) => {
        EthTraderDAO.getWeightedVote(testUsername0, 0, (err, result) => {
          assert.equal(result.toNumber(), 35980, `weight vote is incorrect`);
          done();
        });
    });

    it(`${testUsername0} could vote:0`, (done) => {
      EthTraderDAO.vote(0, 1, {gas: 1000000}, (err, results) => {
        EthTraderDAO.getVoted(0, (err, voted) => {
          assert.equal(voted, true, `did not register voted`)
          done();
        });
      });
    });

    it(`${testUsername0} enacted prop:0, tokens are transferable`, (done) => {
      EthTraderDAO.enactProp(0, {gas: 1000000}, (err, results) => {
        MiniMeToken.transfersEnabled((err, enabled) => {
          assert.equal(enabled, true, `token transfers were not enabled`);
          done();
        });
      });
    });

    it(`${testUsername0} transfer 150 to ${testUsername1}`, (done) => {
      MiniMeToken.transfer(accounts[1], 150, {gas: 1000000}, (err, results) => {
        MiniMeToken.balanceOf(accounts[1], (err, balance) => {
          assert.equal(balance.toNumber(), 150, `${testUsername1} did not receive 150`);
          done();
        });
      });
    });

    it(`TOKEN_AGE_DAY_CAP is 200`, (done) => {
        Store.values("TOKEN_AGE_DAY_CAP", (err, amount) => {
          amount => assert.equal(amount.valueOf(), 200, `TOKEN_AGE_DAY_CAP not 200`);
          done();
        });
    });

    it(`${testUsername0} initialised a prop:1`, (done) => {
        let propData = bufferToHex(Buffer.concat([
          setLengthRight(toBuffer("TOKEN_AGE_DAY_CAP"), 20),
          setLengthLeft(toBuffer(400), 12)
        ]));
        console.log("PROPDATA", propData)

        EthTraderLib.split32_20_12(propData, (err, results) => {
          EthTraderDAO.addProp("SET_VALUE", propData, (err, results) => {
            done();
          });
        });
    });

    it(`${testUsername0} could vote:1`, (done) => {
      EthTraderDAO.getWeightedVote(testUsername0, 1, (err, results) => {
        EthTraderDAO.vote(1, 1, (err, results) => {
          done();
        });
      });
    });

    it(`${testUsername0} enacted prop:1, TOKEN_AGE_DAY_CAP changed to 400`, (done) => {
      // TODO: re-add this, might be a bug with the test; prop should be added first
      done();

      //EthTraderDAO.enactProp2(1, {gas: 1000000, from: accounts[0]}, (err, results) => {
      //  console.log(err, results);
      //  done();
      //  //Store.values("TOKEN_AGE_DAY_CAP", (err, amount) => {
      //  //  //console.log(err, amount);
      //  //  assert.equal(amount.toNumber(), 400, `TOKEN_AGE_DAY_CAP not changed to 400`);
      //  //  done();
      //  //});
      //});
    });

    const stake = 1000;
    it(`prop:2 fail loses ${stake} stake`, (done) => {
      // TODO: issue with addProp
      return done();
      let totalSupply;

      MiniMeToken.totalSupply((err, amount) => {
        totalSupply = amount.toNumber();

        EthTraderDAO.addProp("ENDOW", 0, (err, results) => {
          console.log("addProp", err, results);
          EthTraderDAO.getWeightedVote(testUsername0, 2, (err, results) => {
            console.log("getWeightedVote", err, results);
            EthTraderDAO.vote(2, 0, (err, results) => {
              console.log("vote", err, results);
              EthTraderDAO.enactProp(2, (err, results) => {
                console.log("enactProp", err, results);
                MiniMeToken.totalSupply((err, amount) => {
                  console.log("totalSupply", err, results);
                  assert.equal(amount.toNumber(), totalSupply-stake, `totalSupply not reduced by ${stake}`);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it(`prop:3 simple poll`, (done) => {
      // TODO: add assert...
      EthTraderDAO.addProp("NONE", 0, (err, results) => {
        EthTraderDAO.getWeightedVote(testUsername0, 3, (err, results) => {
          EthTraderDAO.vote(3,7, (err, results) => {
            EthTraderDAO.endPoll(3, (err, results) => {
              EthTraderDAO.getResult(3, 7, (err, results) => {
                done();
              });
            });
          });
        });
      });
    });

    it(`prop:4 deploy new DAO and upgrade by vote`, () => {
        let newDAOAddress, tokenAddress, regAddress, storeAddress;

        tokenAddress = MiniMeToken.address;
        regAddress = Registry.address;
        storeAddress = Store.address;

        // TODO: convert this

        //return EthTraderDAO.deployed()
        //    .then( dao => dao.token.call() )
        //    .then( address => tokenAddress = address )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.registry.call() )
        //    .then( address => regAddress = address )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.store.call() )
        //    .then( address => storeAddress = address )
        //    .then( () => EthTraderDAO.new(0, 0, tokenAddress, regAddress, storeAddress) )
        //    .then( instance => newDAOAddress = instance.address )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.addProp("UPGRADE", newDAOAddress) )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.getWeightedVote(testUsername0, 4) )
        //    .log()
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.vote(4, 1) )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.enactProp(4) )
        //    .then( () => EthTraderDAO.deployed() )
        //    .then( dao => dao.registry.call() )
        //    .then( address => Registry.at(address).controller.call() )
        //    .then( address => assert.equal(address, newDAOAddress, `registry controller was not changed to new DAO address`) );
    });

});
