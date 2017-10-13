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
const setLengthLeft = utils.setLengthLeft;
const setLengthRight = utils.setLengthRight;
const users = require("./data/users.json");
const fs = require("fs");

// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const username = "MrKup";
// const username = "doppio";
// const username = "carlslarson";
const userIdx = users.findIndex(u=>u.username===username)
const userArrays = users.map(u=>[u.address, u.username, u.joined, [u.ethereumPosts, u.ethtraderPosts, u.ethdevPosts, u.etherminingPosts], [u.ethereumComments, u.ethtraderComments, u.ethdevComments, u.etherminingComments], [u.modStartDateEthereum || 0, u.modStartDateEthtrader || 0, u.modStartDateEtherdev || 0, u.modStartDateEthermining || 0]])

// console.log(Number.isInteger(247283000)

const userHashBuffers = users.map(u=>{
  // let userBuffer = toBuffer(u.address);
  // let userBuffer = utils.setLengthRight(toBuffer(u.username), 20);
  // let userBuffer = Buffer.concat([
  //   toBuffer(u.address),
  //   setLengthRight(toBuffer(u.username), 20),
  //   setLengthLeft(toBuffer(u.joined), 4)
  // ])
  let userBuffer = Buffer.concat([
    toBuffer(u.address),
    utils.setLengthRight(toBuffer(u.username), 20),
    setLengthLeft(toBuffer(u.joined), 4),
    Buffer.concat([
      setLengthLeft(toBuffer(u.ethereumPosts), 32),
      setLengthLeft(toBuffer(u.ethtraderPosts), 32),
      setLengthLeft(toBuffer(u.ethdevPosts), 32),
      setLengthLeft(toBuffer(u.etherminingPosts), 32)
    ]),
    Buffer.concat([
      setLengthLeft(toBuffer(u.ethereumComments), 32),
      setLengthLeft(toBuffer(u.ethtraderComments), 32),
      setLengthLeft(toBuffer(u.ethdevComments), 32),
      setLengthLeft(toBuffer(u.etherminingComments), 32)
    ]),
    Buffer.concat([
      setLengthLeft(toBuffer(u.modStartDateEthereum || 0), 32),
      setLengthLeft(toBuffer(u.modStartDateEthtrader || 0), 32),
      setLengthLeft(toBuffer(u.modStartDateEtherdev || 0), 32),
      setLengthLeft(toBuffer(u.modStartDateEthermining || 0), 32)
    ])
  ])
  return keccak256(userBuffer)
})
// const userHashesHex = userHashBuffers.map(b=>bufferToHex(b))

const merkleTree = new MerkleTree(userHashBuffers)

const userRegInputs = userArrays.map((ua,idx)=>{
  let address = ua.shift();
  ua.push(merkleTree.getProof(userHashBuffers[idx]).map(p=>bufferToHex(p)))
  return ua
})

const root = bufferToHex(merkleTree.getRoot())

fs.writeFileSync(`${__dirname}/out/userRegInputs.json`, JSON.stringify(userRegInputs))
fs.writeFileSync(`${__dirname}/out/root.json`, JSON.stringify(root))
// TODO properly calculate modDayRate
fs.writeFileSync(`${__dirname}/out/modDayRate.json`, JSON.stringify(24))

// const proof = merkleTree.getProof(userHashBuffers[userIdx])
// console.log(JSON.stringify(userArrays[userIdx]))
// console.log(proof.map(p=>bufferToHex(p)))
console.log(`${username} hash: ${bufferToHex(userHashBuffers[userIdx])}`)
console.log(`root: ${root}`)
