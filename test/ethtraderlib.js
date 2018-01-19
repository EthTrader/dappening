const userRegInputs = require("../out/userRegInputs.json");
const merkleRoot = require("../out/merkleRoot.json");

const testUsername1 = "heliumcraft";//"doppio";
const testData1 = userRegInputs[userRegInputs.findIndex(u=>u[0]===testUsername1)];

let accounts;

var MerkleTree = require('merkle-tree-solidity');
var checkProof = MerkleTree.checkProof;
var sha3 = require('ethereumjs-util').sha3;
const elements = [1, 2, 3].map(e => sha3(e))
const merkleTree = new MerkleTree.default(elements)
const root = merkleTree.getRoot()
const proof = merkleTree.getProof(elements[0])
var proofResult = checkProof(proof, root, elements[0])

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
