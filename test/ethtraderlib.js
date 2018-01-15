const utils = require("ethereumjs-util");
const { toBuffer, bufferToHex, setLengthLeft, setLengthRight } = utils;
const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");
const modDayRate = require("../out/modDayRate.json");
require('promise-log')(Promise);

const testUsername0 = "carlslarson";
const testData0 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername0)];
console.log(testData0);
testData0.splice(-1,1); // remove address
testData0.push(0);      // add merkle root index
const testUsername1 = "heliumcraft";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];
console.log(testData1)
var async = require('async');

let accounts;

var MerkleTree = require('merkle-tree-solidity');
var checkProof = MerkleTree.checkProof;
var checkProofSolidityFactory = MerkleTree.checkProofSolidityFactory;
var sha3 = require('ethereumjs-util').sha3;
var web3 = require('web3');

const elements = [1, 2, 3].map(e => sha3(e))
const merkleTree = new MerkleTree.default(elements)
const root = merkleTree.getRoot()
const easyRoot = MerkleTree.merkleRoot(elements)
const proof = merkleTree.getProof(elements[0])
var proofResult = checkProof(proof, root, elements[0])
console.log('proofResult', proofResult);

const secret = require("../.secret.json");
config({
  mnemonic: secret.mnemonic
});


contract('EthTraderLib', function() {
    this.timeout(40000);
    before(function(done) {
      var contractsConfig = {
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
          "deploy": false
        }
      };
      EmbarkSpec.deployAll(contractsConfig, (_accounts) => {
        accounts = _accounts;
        console.log(accounts);
        done();
      });
    });

    it(`should return true for a valid proof`, (done) => {
      var _proof = proof.map((x) => { return web3.utils.bytesToHex(x); });
      var _root = web3.utils.bytesToHex(root);
      var elements_0 = web3.utils.bytesToHex(elements[0]);

      EthTraderLib.methods.checkProof(_proof, _root, elements_0).call().then((result) => {
        assert.ok(result, `proof is valid but failed`);
        done();
      });
    });

    it(`should return false for an invalid proof`, (done) => {
      var _proof = proof.map((x) => { return web3.utils.bytesToHex(x); }).reverse();
      var _root = web3.utils.bytesToHex(root);
      var elements_0 = web3.utils.bytesToHex(elements[0]);

      EthTraderLib.methods.checkProof(_proof, _root, elements_0).call().then((result) => {
        assert.ok(result==false, `proof is invalid but returned true anyway`);
        done();
      });
    });

    it(`should support keccak256`, (done) => {
      [_username, _endowment, _firstContent, _proof, _rootIndex] = testData1;

      EthTraderLib.methods.ethereumSHA3(web3.utils.asciiToHex(_username), _endowment, _firstContent).call().then((results) => {
        console.log(results);
        done();
      })
    });

});
