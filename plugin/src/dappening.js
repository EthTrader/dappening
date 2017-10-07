import Web3 from 'web3';
import Promise from 'bluebird';

const $users = document.querySelectorAll('a[href^="https://www.reddit.com/user/"]');
// const eth = new Eth(new Eth.HttpProvider('https://rinkeby.infura.io'));
const web3 = new Web3('https://rinkeby.infura.io');

const regAbi = [{"constant":true,"inputs":[{"name":"_usernames","type":"bytes20[]"}],"name":"getAddressBatchByUsername","outputs":[{"name":"addresses","type":"address[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"users","outputs":[{"name":"username","type":"bytes20"},{"name":"owner","type":"address"},{"name":"joined","type":"uint32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"subIdx","type":"uint256"},{"name":"_usernames","type":"bytes20[]"}],"name":"getSubScoreBatchByUsername","outputs":[{"name":"scores","type":"uint256[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"bytes20"},{"name":"_joined","type":"uint32"},{"name":"_postScores","type":"uint24[4]"},{"name":"_commentScores","type":"uint24[4]"},{"name":"_modStarts","type":"uint32[4]"},{"name":"proof","type":"bytes32[]"}],"name":"check","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_usernames","type":"bytes20[]"}],"name":"getIdxBatchByUsername","outputs":[{"name":"registered","type":"uint256[20]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"bytes20"}],"name":"getUserByUsername","outputs":[{"name":"username","type":"bytes20"},{"name":"owner","type":"address"},{"name":"joined","type":"uint32"},{"name":"postScores","type":"uint24[4]"},{"name":"commentScores","type":"uint24[4]"},{"name":"modStarts","type":"uint32[4]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes20"}],"name":"usernameToIdx","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_username","type":"bytes20"},{"name":"_joined","type":"uint32"},{"name":"_postScores","type":"uint24[4]"},{"name":"_commentScores","type":"uint24[4]"},{"name":"_modStarts","type":"uint32[4]"},{"name":"proof","type":"bytes32[]"}],"name":"register","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"ownerToIdx","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"userIdx","type":"uint256"}],"name":"UserRegistered","type":"event"}];

const reg = new web3.eth.Contract(regAbi, "0x472805E20574d61F0e3C3814DB55f246261d8c84");

console.log(reg)
//
// console.log($users);

Promise.map($users, $user=>{
  let username = $user.href.replace("https://www.reddit.com/user/", "").replace("\/", "");
  // console.log(username);
  return reg.methods.usernameToIdx(web3.utils.asciiToHex(username)).call().then(parseInt).then(idx=>{
    if (idx) $user.style.border = "2px solid red";
    console.log(idx, typeof(idx));
  })
});
