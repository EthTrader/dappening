let account;

switch(process.env.NODE_ENV){
  case 'production':
    account = {
      mnemonic: require("./.secret.json")
    };

  default:
    account = {
      mnemonic: "outside consider provide bid target obey cycle crunch because permit guilt vacuum until plug cave"   // dummy account 'TEST_USER'
    };
}


module.exports = account;
