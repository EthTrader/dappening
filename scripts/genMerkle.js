const MerkleTreeSolidity = require("merkle-tree-solidity");
const Web3 = require("web3");
const MerkleTree = MerkleTreeSolidity.default;
const checkProof = MerkleTreeSolidity.checkProof;
const merkleRoot = MerkleTreeSolidity.merkleRoot;
const checkProofSolidityFactory = MerkleTreeSolidity.checkProofSolidityFactory;
const utils = require("ethereumjs-util");
const keccak256 = utils.sha3;
const calcEndowment = require('./calcEndowment');
// const keccak256 = require('js-sha3').keccak256;
// const sha3 = require("solidity-sha3").default;
const toBuffer = utils.toBuffer;
const bufferToHex = utils.bufferToHex;
const setLengthLeft = utils.setLengthLeft;
const setLengthRight = utils.setLengthRight;
const users = require("../data/users.json");
const fs = require("fs");

const userArrays = users.map(u=>[u.address, u.username, calcEndowment(u), u.firstContent]);

const userHashBuffers = userArrays.map(u=>{
  let userBuffer = Buffer.concat([
    toBuffer(u[0]),
    setLengthRight(toBuffer(u[1]), 20),
    setLengthLeft(toBuffer(u[2]), 3),
    setLengthLeft(toBuffer(u[3]), 4)
  ])
  return keccak256(userBuffer)
})
// const userHashesHex = userHashBuffers.map(b=>bufferToHex(b))

const merkleTree = new MerkleTree(userHashBuffers)

const userRegInputs = userArrays.map((ua,idx)=>{
  let address = ua.shift();
  ua.push(merkleTree.getProof(userHashBuffers[idx]).map(p=>bufferToHex(p)))
  ua.push(address);
  return ua
})

const root = bufferToHex(merkleTree.getRoot())

fs.writeFileSync(`${__dirname}/../out/userRegInputs.json`, JSON.stringify(userRegInputs))
fs.writeFileSync(`${__dirname}/../out/merkleRoot.json`, JSON.stringify(root))
// TODO properly calculate modDayRate
fs.writeFileSync(`${__dirname}/../out/modDayRate.json`, JSON.stringify(24))

// const username = "MrKup";
// const username = "doppio";
const username = "carlslarson";
const userIdx = users.findIndex(u=>u.username===username)
// const proof = merkleTree.getProof(userHashBuffers[userIdx])
// console.log(JSON.stringify(userArrays[userIdx]))
// console.log(proof.map(p=>bufferToHex(p)))
console.log(`${username} hash: ${bufferToHex(userHashBuffers[userIdx])}`)
console.log(`root: ${root}`)
