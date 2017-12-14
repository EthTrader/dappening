const HDWalletProvider = require("truffle-hdwallet-provider");
const secret = require("./.secret.json");

module.exports = {
  networks: {
    test: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5000000
    },
    ropsten: {
      provider: new HDWalletProvider(secret.mnemonic, "https://ropsten.infura.io/"+secret.infuraApikey),
      network_id: 3
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x80f66D2E0eaFa73910ED0B5d411640b48d23B838", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
    // rinkeby: {
    //   provider: new HDWalletProvider(secret.mnemonic, "https://rinkeby.infura.io/"+secret.infuraApikey),
    //   network_id: 4,
    //   gas: 4000000 // Gas limit used for deploys
    // }
  }
};
