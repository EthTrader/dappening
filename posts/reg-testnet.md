Dappening: Progress report, registration process, and testnet demo

The Dappening is an experiment within the Reddit Ethereum community to explore how these two tools could be used for further mutual benefit. Since the original [dappening thread](https://www.reddit.com/r/ethtrader/comments/72scaj/ethtrader_the_dappening/) some progress has been made in the areas deemed necessary to begin this experiment, largely with regard to the tools and procedure necessary for registering usernames and karma. The goals of the registration process are:

1. Allow users from 4 ethereum related subs (r/ethereum, r/ethtrader, r/ethdev, and r/ethermining) to self-register their Reddit usernames along with start date, karma for posts and comments, and mod start dates.
1. Expose this data for consumption by future smart contracts and dapps.

-
-

**How can users self-register their data?**

Please review the proposed procedure for enabling self-registration using merkle tree validation.

1. Data (start date, karma, mod status) for users of the 4 subs has been collected through 30/9/2017. Anyone is free to [re-collect](https://github.com/EthTrader/karma) for verification or other purposes (the scripts work on any sub).
1. During a period of pre-registration users will be able to use a bot ([code](https://github.com/EthTrader/dappening/tree/master/bot)) to check their collected karma and pre-register or update the ethereum address they will use during self-registration.
1. At the end of the pre-registration period a merkle tree will be generated from the user data. The merkle root from this will then be published in the registry contract and the user data and merkle proofs published online. (thanks to u/heliumcraft for the merkle tree suggestion)
1. With their user data and merkle proof, each pre-registered user will have an incorruptible way to self-register with the [registry contract](https://github.com/EthTrader/dappening/blob/master/contracts/RedditRegistry.sol). A [simple dapp](https://ethtrader.github.io/) will help to submit data. Note: **self-registration will irreversibly and publically associate a Reddit username to an Ethereum address and any contracts or addresses that address has transacted with. new/fresh addresses are free to generate.**
1. To demonstrate *some* minimal functionality, [this plugin](https://github.com/EthTrader/plugin) can use the registry to add an 'is-reg' html class to registered usernames. On r/ethtrader this changes their text color to orange.

[The plugin](https://github.com/EthTrader/plugin) currently reads from a registry contract [deployed](https://rinkeby.etherscan.io/address/0x472805e20574d61f0e3c3814db55f246261d8c84) to rinkeby but is limited to data on some r/ethtrader moderators. In the coming days I'd like to deploy a new rinkeby testnet contract. Anyone who wants to help test can check their karma and/or pre-register an address below. After a day or two I'll generate the merkle tree, publish the proofs and users will be able to register on a new testnet [rinkeby] deployed contract. (This would be for **testing only** and on the rinkeby testnet so rinkeby eth ([faucet](https://faucet.rinkeby.io/)) would be needed, and any registrations would need to be redone when the move to mainnet occurs.)

**To check karma**
> !ethreg karma

**To pre-register**
> !ethreg 0xSOMEETHEREUMADDRESS

-
-

**Some stats**

* 57,915 register-able users from r/ethereum, r/ethtrader, r/ethdev, and r/ethermining
* karma from 96,814 posts (sum to 1,959,963) and 1,876,562 comments (sum to 5,924,793) collected

**Code**

* [Karma collection](https://github.com/EthTrader/karma)
* [Dappening (bot, contracts, merkle generation)](https://github.com/EthTrader/dappening)
* [Plugin](https://github.com/EthTrader/plugin)
* [Registration dApp](https://github.com/EthTrader/EthTrader.github.io)
