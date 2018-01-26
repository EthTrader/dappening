const utils = require("ethereumjs-util");
const { toBuffer, bufferToHex, setLengthLeft, setLengthRight } = utils;
// const RegReader = artifacts.require("./RegReader.sol");
const userRegInputs = require("../out/userRegInputs.json");
// const merkleRoot = require("../out/merkleRoot.json");
const contractsConfig = require("../config/contracts.json").default.contracts;
const merkleRoot = contractsConfig.TokenDAO.args[4];
const modDayRate = require("../out/modDayRate.json");
const contractConfig = require("../config/contracts.json");
const { DAO_ACTIONS } = require("../constants");
const decimals = contractsConfig.Token.args[4];
const etr = require("../utils/etr");
require('promise-log')(Promise);

const testUsername0 = "TEST_USER";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
testData0.splice(-1,1); // remove address
testData0.push(0);      // add merkle root index

console.log(testData0);
console.log(merkleRoot)


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

contract('TokenDAO', function() {
    this.timeout(0);
    before(function(done) {
      EmbarkSpec.deployAll(contractsConfig, (_accounts) => {
        accounts = _accounts;
        console.log(accounts);
        done();
      });
    });

    it(`check the dao controls store,token, and registry`, (done) => {
        async.waterfall([
          function(next) {
            Registry.methods.controller().call().then(function(result) {
              assert.equal(result, TokenDAO.address);
              next();
            });
          },
          function(next) {
            Token.methods.controller().call().then(function(result) {
              assert.equal(result, TokenDAO.address);
              next();
            });
          }
        ], done);
    });

    it(`merkle roots[0] matches ${merkleRoot}`, (done) => {
      TokenDAO.methods.roots(0).call().then((root) => {
        assert.equal(root, merkleRoot, `merkle roots[0] doesn't match (${root} vs ${merkleRoot})`);
        done();
      });
    });

    it(`validate ${testUsername0} data`, (done) => {
      TokenDAO.methods.validate(...testData0).call().then((result) => {
        console.log(result);
        assert.ok(result, `${testUsername0} failed merkle validation`);
        done();
      });
    });

    it(`${testUsername0} was registered`, (done) => {
      TokenDAO.methods.register(...testData0).send({from: accounts[0]}).then((result) => {
        TokenDAO.methods.registry().call().then((address) => {
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
      TokenDAO.methods.token().call().then((tokenAddress) => {
        //Token.at(tokenAddress).balanceOf(accounts[0], (amount) => {
        Token.methods.balanceOf(accounts[0]).call().then((amount) => {
          assert.equal(amount, testData0[1], `${testUsername0} was not endowed ${testData0[1]} but ${amount} instead`);
          done();
        });
      });
    });

    it(`token transfers ARE enabled`, (done) => {
      TokenDAO.methods.token().call().then((tokenAddress) => {
        //Token.at(tokenAddress).transfersEnabled((enabled) => {
        Token.methods.transfersEnabled().call().then((enabled) => {
          assert.equal(enabled, true, `token transfers were disabled`);
          done();
        });
      });
    });

    //it(`${testUsername1} was registered@2 with new merkle root@1`, () => {
    //  TokenDAO.addRoot(merkleRoot, (result) => {
    //    TokenDAO.roots(1, (root) => {
    //      assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`);
//
    //      TokenDAO.register(...testData1, {from: accounts[1]}, (result) => {
    //        Registry.usernameToAddress(testUsername1, (address) => {
    //          assert.equal(address, accounts[1], `${testUsername1} was not registered@2`);
    //        });
    //      });
    //    });
    //  });
    //    //return TokenDAO.deployed()
    //    //    .then( dao => dao.addRoot(merkleRoot) )
    //    //    .then( () => TokenDAO.deployed() )
    //    //    .then( dao => dao.roots.call(1) )
    //    //    .then( root => assert.equal(root, merkleRoot, `merkle roots[1] doesn't match (${root} vs ${merkleRoot})`) )
    //    //    .then( tx => TokenDAO.deployed() )
    //    //    .then( dao => dao.register(...testData1, {from: accounts[1]}) )
    //    //    .then( tx => Registry.deployed() )
    //    //    .then( registry => registry.usernameToAddress.call(testUsername1) )
    //    //    .then( address => assert.equal(address, accounts[1], `${testUsername1} was not registered@2`) );
    //});

    it(`${testUsername0} initialised a prop:0`, (done) => {
      TokenDAO.methods.addProp(DAO_ACTIONS.ADD_ROOT.enum, web3.utils.asciiToHex(0)).send().then((results) => {
        TokenDAO.methods.props(0).call().then((prop) => {
          // prop is an object in web3.js 1.0
          //assert.equal(prop.length, 7, `return data length mismatch`);
          console.log(prop);
          assert.equal(prop[5], false, `return data length mismatch`);
          assert.equal(prop[6], undefined, `return data length mismatch`);
          done();
        });
      });
    });

    it(`${testUsername0} weighted vote amount (=initial token balance)`, (done) => {
        Token.methods.initialBalanceOf(accounts[0]).call().then((result) => {
          assert.equal(result, testData0[1], `weight vote is incorrect`);
          done();
        });
    });

    it(`${testUsername0} could vote:0`, (done) => {
      TokenDAO.methods.vote(0, 1).send().then((results) => {
        TokenDAO.methods.getVoted(0).call().then((voted) => {
          assert.equal(voted, true, `did not register voted`)
          done();
        });
      });
    });

    it(`${testUsername0} transfer 150 to ${testUsername1}`, (done) => {
      Token.methods.transfer(accounts[1], etr(150)).send().then((results) => {
        Token.methods.balanceOf(accounts[1]).call().then((balance) => {
          assert.equal(balance, etr(150), `${testUsername1} did not receive 150`);
          done();
        });
      });
    });

    it(`get props`, (done) => {
      TokenDAO.methods.getProps().call().then((results) => {
        console.log(results);
        done();
      });
    });


//    it(`prop:4 deploy new DAO and upgrade by vote`, () => {
//        let newDAOAddress, tokenAddress, regAddress, storeAddress;
//
//        tokenAddress = Token.address;
//        regAddress = Registry.address;
//        storeAddress = Store.address;
//
//        // TODO: convert this
//
//        //return TokenDAO.deployed()
//        //    .then( dao => dao.token.call() )
//        //    .then( address => tokenAddress = address )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.registry.call() )
//        //    .then( address => regAddress = address )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.store.call() )
//        //    .then( address => storeAddress = address )
//        //    .then( () => TokenDAO.new(0, 0, tokenAddress, regAddress, storeAddress) )
//        //    .then( instance => newDAOAddress = instance.address )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.addProp(DAO_ACTIONS.UPGRADE.enum, newDAOAddress) )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.getWeightedVote(testUsername0, 4) )
//        //    .log()
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.vote(4, 1) )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.enactProp(4) )
//        //    .then( () => TokenDAO.deployed() )
//        //    .then( dao => dao.registry.call() )
//        //    .then( address => Registry.at(address).controller.call() )
//        //    .then( address => assert.equal(address, newDAOAddress, `registry controller was not changed to new DAO address`) );
//    });

});
