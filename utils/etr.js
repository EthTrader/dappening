const contractConfig = require("../config/contracts.json");
const decimals = contractConfig.default.contracts.MiniMeToken.args[4];

module.exports = function(num){
  return num * Math.pow(10, decimals);
}
