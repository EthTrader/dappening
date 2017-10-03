const MerkleTreeSolidity = require("merkle-tree-solidity");
const MerkleTree = MerkleTreeSolidity.default;
const checkProof = MerkleTreeSolidity.checkProof;
const merkleRoot = MerkleTreeSolidity.merkleRoot;
const checkProofSolidityFactory = MerkleTreeSolidity.checkProofSolidityFactory;
const utils = require("ethereumjs-util");
const sha3 = utils.sha3;
// const sha3 = require("solidity-sha3").default;
const toBuffer = utils.toBuffer;
const bufferToHex = utils.bufferToHex;
const users = require("./data/users.json");
const fs = require("fs");

const username = "carlslarson";
const userIdx = users.findIndex(u=>u.username===username)
const userArrays = users.map(u=>[u.address, u.username, u.joined])//, [u.ethereumPosts, u.ethtraderPosts, u.ethdevPosts, u.etherminingPosts], [u.ethereumComments, u.ethtraderComments, u.ethdevComments, u.etherminingComments], [u.modStartDateEthereum || 0, u.modStartDateEthtrader || 0, u.modStartDateEtherdev || 0, u.modStartDateEthermining || 0]])

const userHashBuffers = users.map(u=>{
  let userBuffer = toBuffer(u.address);
  // let userBuffer = Buffer.concat([
  //   toBuffer(u.address),
  //   toBuffer(u.username),
  //   toBuffer(u.joined),
  //   // Buffer.concat([toBuffer(u.ethereumPosts), toBuffer(u.ethtraderPosts), toBuffer(u.ethdevPosts), toBuffer(u.etherminingPosts)]),
  //   // Buffer.concat([toBuffer(u.ethereumComments), toBuffer(u.ethtraderComments), toBuffer(u.ethdevComments), toBuffer(u.etherminingComments)]),
  //   // Buffer.concat([toBuffer(u.modStartDateEthereum || 0), toBuffer(u.modStartDateEthtrader || 0), toBuffer(u.modStartDateEtherdev || 0), toBuffer(u.modStartDateEthermining || 0)])
  // ])
  // return toBuffer(sha3(userBuffer))])
  return sha3(userBuffer)
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
