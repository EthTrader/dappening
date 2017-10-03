const MerkleTreeSolidity = require("merkle-tree-solidity");
const Web3 = require("web3");
const MerkleTree = MerkleTreeSolidity.default;
const checkProof = MerkleTreeSolidity.checkProof;
const merkleRoot = MerkleTreeSolidity.merkleRoot;
const checkProofSolidityFactory = MerkleTreeSolidity.checkProofSolidityFactory;
const utils = require("ethereumjs-util");
const keccak256 = utils.sha3;
// const keccak256 = require('js-sha3').keccak256;
// const sha3 = require("solidity-sha3").default;
const toBuffer = utils.toBuffer;
const bufferToHex = utils.bufferToHex;
const users = require("./data/users.json");
const fs = require("fs");
const pad = require('pad');

// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const username = "carlslarson";
const userIdx = users.findIndex(u=>u.username===username)
const userArrays = users.map(u=>[u.address, u.username, parseInt(u.joined/1000), [u.ethereumPosts, u.ethtraderPosts, u.ethdevPosts, u.etherminingPosts], [u.ethereumComments, u.ethtraderComments, u.ethdevComments, u.etherminingComments], [parseInt(u.modStartDateEthereum/1000) || 0, parseInt(u.modStartDateEthtrader/1000) || 0, parseInt(u.modStartDateEtherdev/1000) || 0, parseInt(u.modStartDateEthermining/1000) || 0]])

// console.log(Number.isInteger(247283000/1000))

const userHashBuffers = users.map(u=>{
  // let userBuffer = toBuffer(u.address);
  // let userBuffer = utils.setLengthRight(toBuffer(u.username), 20);
  let userBuffer = Buffer.concat([
    toBuffer(u.address),
    utils.setLengthRight(toBuffer(u.username), 20),
    utils.setLengthLeft(toBuffer(parseInt(u.joined/1000)), 4)
  ])
  // let userBuffer = Buffer.concat([
  //   // toBuffer(u.address),
  //   // utils.setLengthRight(toBuffer(u.username), 20),
  //   // utils.setLengthLeft(toBuffer(parseInt(u.joined/1000)), 4),
  //   Buffer.concat([utils.setLengthLeft(toBuffer(u.ethereumPosts), 3), utils.setLengthLeft(toBuffer(u.ethtraderPosts), 3), utils.setLengthLeft(toBuffer(u.ethdevPosts), 3), utils.setLengthLeft(toBuffer(u.etherminingPosts), 3)]),
  //   // Buffer.concat([utils.setLengthLeft(toBuffer(u.ethereumComments), 3), utils.setLengthLeft(toBuffer(u.ethtraderComments), 3), utils.setLengthLeft(toBuffer(u.ethdevComments), 3), utils.setLengthLeft(toBuffer(u.etherminingComments), 3)]),
  //   // Buffer.concat([utils.setLengthLeft(toBuffer(parseInt(u.modStartDateEthereum/1000) || 0), 4), utils.setLengthLeft(toBuffer(parseInt(u.modStartDateEthtrader/1000) || 0), 4), utils.setLengthLeft(toBuffer(parseInt(u.modStartDateEtherdev/1000) || 0), 4), utils.setLengthLeft(toBuffer(parseInt(u.modStartDateEthermining/1000) || 0), 4)])
  // ])
  return toBuffer(keccak256(userBuffer))
  // return toBuffer(`0x${keccak256(pad(u.username, 20))}`)
})
// const userHashesHex = userHashBuffers.map(b=>bufferToHex(b))

const merkleTree = new MerkleTree(userHashBuffers)

const userRegInputs = userArrays.map((ua,idx)=>{
  let address = ua.shift();
  ua.push(merkleTree.getProof(userHashBuffers[idx]).map(p=>bufferToHex(p)))
  return ua
})

fs.writeFileSync(`${__dirname}/out/userRegInputs.json`, JSON.stringify(userRegInputs))

// const proof = merkleTree.getProof(userHashBuffers[userIdx])
// console.log(JSON.stringify(userArrays[userIdx]))
// console.log(proof.map(p=>bufferToHex(p)))

const root = merkleTree.getRoot()
console.log(`carlslarson hash: ${bufferToHex(userHashBuffers[userIdx])}`)
console.log(`root: ${bufferToHex(root)}`)
