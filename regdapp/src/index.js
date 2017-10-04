import Web3 from 'web3';
import Promise from 'bluebird';

const web3 = new Web3('http://localhost:8545');
// const web3 = new Web3('https://rinkeby.infura.io');

const regAbi = [{"constant":true,"inputs":[{"name":"_usernames","type":"bytes20[]"}],"name":"getAddressBatchByUsername","outputs":[{"name":"addresses","type":"address[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"users","outputs":[{"name":"username","type":"bytes20"},{"name":"owner","type":"address"},{"name":"joined","type":"uint32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"subIdx","type":"uint256"},{"name":"_usernames","type":"bytes20[]"}],"name":"getSubScoreBatchByUsername","outputs":[{"name":"scores","type":"uint256[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"bytes20"},{"name":"_joined","type":"uint32"},{"name":"_postScores","type":"uint24[4]"},{"name":"_commentScores","type":"uint24[4]"},{"name":"_modStarts","type":"uint32[4]"},{"name":"proof","type":"bytes32[]"}],"name":"check","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_usernames","type":"bytes20[]"}],"name":"getIdxBatchByUsername","outputs":[{"name":"registered","type":"uint256[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"userIdxFromOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"bytes20"}],"name":"getUserByUsername","outputs":[{"name":"username","type":"bytes20"},{"name":"owner","type":"address"},{"name":"joined","type":"uint32"},{"name":"postScores","type":"uint24[4]"},{"name":"commentScores","type":"uint24[4]"},{"name":"modStarts","type":"uint32[4]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_username","type":"bytes20"},{"name":"_joined","type":"uint32"},{"name":"_postScores","type":"uint24[4]"},{"name":"_commentScores","type":"uint24[4]"},{"name":"_modStarts","type":"uint32[4]"},{"name":"proof","type":"bytes32[]"}],"name":"register","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes20"}],"name":"userIdxFromUsername","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"userIdx","type":"uint256"}],"name":"UserRegistered","type":"event"}];

const reg = new web3.eth.Contract(regAbi, "0xEF8aE0ACb5E25215fb397649CC78d65BafDE6F4A");

reg.methods.userIdxFromUsername(web3.utils.asciiToHex("carlslarson")).call()
  .then(parseInt)
  .then(idx=>{
    document.getElementById("idx").innerText = idx;
  });

document.getElementById("submit").onclick = function(){

  let data = document.getElementById("data").value;
  if(data[0] !== "[" || data[data.length-1] !== "]") data = "[" + data + "]";
  try {
    data = JSON.parse(data);
    console.log(data);
    if(data.length !== 6) {
      console.log("input data not valid", e);
      return;
    }

    let privkey = document.getElementById("privkey").value;
    if(privkey.slice(0,2) !== "0x") privkey = "0x" + privkey;
    const account = web3.eth.accounts.privateKeyToAccount(privkey);
    console.log(account)
    web3.eth.accounts.wallet.add(account);

    register(account, data);
  } catch (e) {
    console.log("input data not valid", e);
  }
}

function register(account, data){
  let usernameHex = web3.utils.asciiToHex(data[0]);
  reg.methods.register(usernameHex, ...data.slice(1)).send({from: account.address, gas: 400000})
    .then(res=>{
      console.log(res);
    });
}
