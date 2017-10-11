const HDWalletProvider = require("truffle-hdwallet-provider");
const secret = require("./.secret.json");

module.exports = {
  networks: {
    test: {
      provider: new HDWalletProvider(secret.mnemonic, "http://localhost:8545/"),
      // host: "localhost",
      // port: 8545,
      network_id: "*", // Match any network id
      gas: 20000000
    },
    ropsten: {
      provider: new HDWalletProvider(secret.mnemonic, "https://ropsten.infura.io/"+secret.infuraApikey),
      network_id: 3
    },
    rinkeby: {
      provider: new HDWalletProvider(secret.mnemonic, "https://rinkeby.infura.io/"+secret.infuraApikey),
      network_id: 4,
      gas: 4000000 // Gas limit used for deploys
    }
  }
};

// 0xFdF500D77363369A0b3277dd1cAE8BB298921bfe
