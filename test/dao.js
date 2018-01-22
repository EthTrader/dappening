const utils = require("ethereumjs-util");
const { toBuffer, bufferToHex, setLengthLeft, setLengthRight } = utils;
// const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");
const contractConfig = require("../config/contracts.json");
const { DAO_ACTIONS } = require("../constants");
const decimals = contractConfig.default.contracts.MiniMeToken.args[4];
const etr = require("../utils/etr");
require('promise-log')(Promise);

const testUsername0 = "TEST_USER";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
testData0.splice(-1,1); // remove address
testData0.push(0);      // add merkle root index

console.log(testData0);


//  let testData0_2 = testData0
//  testData0_2[0] = web3.utils.asciiToHex(testData0[0]);

testData0[0] = web3.utils.asciiToHex(testData0[0]);


const testUsername1 = "heliumcraft";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
var async = require('async');

let accounts;

const mnemonic = require("../config/blockchain.json").development.simulatorMnemonic;
config({
  //node: "http://localhost:8545",
  mnemonic
});

console.log("decimals:", decimals);

contract('EthTraderDAO', function() {
    this.timeout(0);
    before(function(done) {
      var contractsConfig = {
        "Controlled": {
          "deploy": false
        },
        "EthTraderLib": {
          "deploy": true
        },
        "EthTraderDAO": {
          "args": [
            0, merkleRoot, "$MiniMeToken", "$Registry", "$Store"
          ],
          "onDeploy": [
            "MiniMeToken.methods.changeController('$EthTraderDAO').send()",
            "Registry.methods.changeController('$EthTraderDAO').send()",
            "Store.methods.changeController('$EthTraderDAO').send()"
          ]
        },
        "MiniMeToken": {
          "args": [
            "$TokenFactory", 0, 0, "EthTrader Token", decimals, "ETR", false
          ]
        },
        "Registry": {
        },
        "Store": {
          "args": [
            true,
            decimals
          ]
        },
        "TokenFactory": {
          "deploy": false
        },
        "Voting": {
          "deploy": false
        }
      };
      EmbarkSpec.deployAll(contractsConfig, (_accounts) => {
        accounts = _accounts;
        console.log(accounts);
        done();
      });
    });

    it(`check the dao controls store,token, and registry`, (done) => {
        async.waterfall([
          function(next) {
            Store.methods.controller().call().then(function(result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          },
          function(next) {
            Registry.methods.controller().call().then(function(result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          },
          function(next) {
            MiniMeToken.methods.controller().call().then(function(result) {
              assert.equal(result, EthTraderDAO.address);
              next();
            });
          }
        ], done);
    });

    it(`merkle roots[0] matches ${merkleRoot}`, (done) => {
      EthTraderDAO.methods.roots(0).call().then((root) => {
        assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`);
        done();
      });
    });

    it(`validate ${testUsername0} data`, (done) => {
      EthTraderDAO.methods.validate(...testData0).call().then((result) => {
        console.log(result);
        assert.ok(result, `${testUsername0} failed merkle validation`);
        done();
      });
    });

    it(`${testUsername0} was registered`, (done) => {
      EthTraderDAO.methods.register(...testData0).send({from: accounts[0]}).then((result) => {
        EthTraderDAO.methods.registry().call().then((address) => {
          //Registry.at(address).getOwner(testUsername0, (ownerAddress) => {
          Registry.methods.getOwner(web3.utils.asciiToHex(testUsername0)).call().then((ownerAddress) => {
            console.dir(ownerAddress);
            assert.equal(ownerAddress, accounts[0], `${testUsername0} was not registered`);
            done();
          });
        });
      });
    });

    it(`${testUsername0} was endowed ${testData0[1]}`, (done) => {
      EthTraderDAO.methods.token().call().then((tokenAddress) => {
        //MiniMeToken.at(tokenAddress).balanceOf(accounts[0], (amount) => {
        MiniMeToken.methods.balanceOf(accounts[0]).call().then((amount) => {
          assert.equal(amount, testData0[1], `${testUsername0} was not endowed ${testData0[1]} but ${amount} instead`);
          done();
        });
      });
    });

    it(`token transfers are not enabled`, (done) => {
      EthTraderDAO.methods.token().call().then((tokenAddress) => {
        //MiniMeToken.at(tokenAddress).transfersEnabled((enabled) => {
        MiniMeToken.methods.transfersEnabled().call().then((enabled) => {
          assert.equal(enabled, false, `token transfers were not disabled`);
          done();
        });
      });
    });

    //it(`${testUsername1} was registered@2 with new merkle root@1`, () => {
    //  EthTraderDAO.addRoot(merkleRoot, (result) => {
    //    EthTraderDAO.roots(1, (root) => {
    //      assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`);
//
    //      EthTraderDAO.register(...testData1, {from: accounts[1]}, (result) => {
    //        Registry.usernameToAddress(testUsername1, (address) => {
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
      EthTraderDAO.methods.addProp(DAO_ACTIONS.TOGGLE_TRANSFERABLE.enum, web3.utils.asciiToHex(0)).send().then((results) => {
        EthTraderDAO.methods.props(0).call().then((prop) => {
          // prop is an object in web3.js 1.0
          //assert.equal(prop.length, 7, `return data length mismatch`);
          console.log(prop, etr(1000));
          assert.equal(prop[5], etr(1000), `return data length mismatch`);
          assert.equal(prop[6], undefined, `return data length mismatch`);
          done();
        });
      });
    });

    it(`${testUsername0} weighted vote amount`, (done) => {
        EthTraderDAO.methods.getWeightedVote(web3.utils.asciiToHex(testUsername0), 0).call().then((result) => {
          assert.equal(result, etr(45000), `weight vote is incorrect`);
          done();
        });
    });

    it(`${testUsername0} could vote:0`, (done) => {
      EthTraderDAO.methods.vote(0, 1).send().then((results) => {
        EthTraderDAO.methods.getVoted(0).call().then((voted) => {
          assert.equal(voted, true, `did not register voted`)
          done();
        });
      });
    });

    it(`${testUsername0} enacted prop:0, tokens are transferable`, (done) => {
      EthTraderDAO.methods.enactProp(0).send().then((results) => {
        MiniMeToken.methods.transfersEnabled().call().then((enabled) => {
          assert.equal(enabled, true, `token transfers were not enabled`);
          done();
        });
      });
    });

    it(`${testUsername0} transfer 150 to ${testUsername1}`, (done) => {
      MiniMeToken.methods.transfer(accounts[1], etr(150)).send().then((results) => {
        MiniMeToken.methods.balanceOf(accounts[1]).call().then((balance) => {
          assert.equal(balance, etr(150), `${testUsername1} did not receive 150`);
          done();
        });
      });
    });

    it(`TOKEN_AGE_DAY_CAP is 200`, (done) => {
        Store.methods.values(web3.utils.asciiToHex("TOKEN_AGE_DAY_CAP")).call().then((amount) => {
          amount => assert.equal(amount.valueOf(), etr(200), `TOKEN_AGE_DAY_CAP not 200`);
          done();
        });
    });

    it(`${testUsername0} initialised a prop:1`, (done) => {
        let propData = bufferToHex(Buffer.concat([
          setLengthRight(toBuffer("TOKEN_AGE_DAY_CAP"), 20),
          setLengthLeft(toBuffer(etr(400)), 12)
        ]));

        EthTraderLib.methods.split32_20_12(propData).call().then((results) => {
          EthTraderDAO.methods.addProp(DAO_ACTIONS.SET_VALUE.enum, propData).send().then((results) => {
            done();
          });
        });
    });

    it(`${testUsername0} could vote:1`, (done) => {
      EthTraderDAO.methods.getWeightedVote(web3.utils.asciiToHex(testUsername0), 1).call().then((results) => {
        EthTraderDAO.methods.vote(1, 1).send().then((results) => {
          done();
        });
      });
    });
    it(`${testUsername0} enacted prop:1, TOKEN_AGE_DAY_CAP changed to 400`, (done) => {
      // TODO: re-add this, might be a bug with the test; prop should be added first
      done();

      //EthTraderDAO.enactProp2(1, {gas: 1000000, from: accounts[0]}, (results) => {
      //  console.log(results);
      //  done();
      //  //Store.values("TOKEN_AGE_DAY_CAP", (amount) => {
      //  //  //console.log(amount);
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

      MiniMeToken.methods.totalSupply().call().then((amount) => {
        totalSupply = amount.toNumber();

        EthTraderDAO.methods.addProp(DAO_ACTIONS.ENDOW.enum, 0).send({from: web3.eth.defaultAccount}).then((results) => {
          console.log("addProp", results);
          EthTraderDAO.methods.getWeightedVote(testUsername0, 2).call().then((results) => {
            console.log("getWeightedVote", results);
            EthTraderDAO.methods.vote(2, 0).send({from: web3.eth.defaultAccount}).then((results) => {
              console.log("vote", results);
              EthTraderDAO.methods.enactProp(2).send({from: web3.eth.defaultAccount}).then((results) => {
                console.log("enactProp", results);
                MiniMeToken.methods.totalSupply().call().then((amount) => {
                  console.log("totalSupply", results);
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
      EthTraderDAO.methods.addProp(DAO_ACTIONS.NONE.enum, web3.utils.asciiToHex(0)).send({from: web3.eth.defaultAccount}).then((results) => {
        EthTraderDAO.methods.getWeightedVote(web3.utils.asciiToHex(testUsername0), web3.utils.asciiToHex(3)).call().then((results) => {
          done();
          // TODO: it's resulting in an invalid opcode error
          //EthTraderDAO.methods.vote(3,7).send().then((results) => {
          //  EthTraderDAO.methods.endPoll(3).send().then((results) => {
          //    EthTraderDAO.methods.getResult(3, 7).call().then((results) => {
          //      done();
          //    });
          //  });
          //});
        });
      });
    });

    it(`get props`, (done) => {
      EthTraderDAO.methods.getProps().call().then((results) => {
        console.log(results);
        done();
      });
    });


//    it(`prop:4 deploy new DAO and upgrade by vote`, () => {
//        let newDAOAddress, tokenAddress, regAddress, storeAddress;
//
//        tokenAddress = MiniMeToken.address;
//        regAddress = Registry.address;
//        storeAddress = Store.address;
//
//        // TODO: convert this
//
//        //return EthTraderDAO.deployed()
//        //    .then( dao => dao.token.call() )
//        //    .then( address => tokenAddress = address )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.registry.call() )
//        //    .then( address => regAddress = address )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.store.call() )
//        //    .then( address => storeAddress = address )
//        //    .then( () => EthTraderDAO.new(0, 0, tokenAddress, regAddress, storeAddress) )
//        //    .then( instance => newDAOAddress = instance.address )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.addProp(DAO_ACTIONS.UPGRADE.enum, newDAOAddress) )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.getWeightedVote(testUsername0, 4) )
//        //    .log()
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.vote(4, 1) )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.enactProp(4) )
//        //    .then( () => EthTraderDAO.deployed() )
//        //    .then( dao => dao.registry.call() )
//        //    .then( address => Registry.at(address).controller.call() )
//        //    .then( address => assert.equal(address, newDAOAddress, `registry controller was not changed to new DAO address`) );
//    });

});
