Dappening: Progress report, registration process, and testnet demo

The Dappening is an experiment within the Reddit Ethereum community to explore how these two tools could be used for further mutual benefit. Since the original [dappening thread](https://www.reddit.com/r/ethtrader/comments/72scaj/ethtrader_the_dappening/) some progress has been made in the areas deemed necessary to begin this experiment, largely with regard to the tools and procedure necessary for registering usernames and karma. The goals of the registration process are to:

1. Allow users from 4 ethereum related subs (r/ethereum, r/ethtrader, r/ethdev, and r/ethermining) to self-register their Reddit usernames along with start date, karma for posts and comments, and mod status.
1. Expose this data for consumption by future smart contracts and dapps.

-
-

**How can Reddit users self-register their data?**

1. Data (start date, karma, mod status) for users of the 4 subs has been collected through 30/9/2017. Anyone is free to [re-collect](https://github.com/EthTrader/karma) for verification or other purposes (scripts work on any sub).
1. During a period of pre-registration, using a bot ([code](https://github.com/EthTrader/dappening/tree/master/bot)), users will be able to check their collected karma and pre-register or update the ethereum address they will use during self-registration.
1. At the end of the pre-registration period a merkle tree will be generated from the user data. The merkle root from this will then be published in the registry contract and the user data and merkle proofs published online. (thanks to u/heliumcraft for the merkle tree suggestion)
1. With their user data and merkle proof, each pre-registered user will have an incorruptible way to self-register with the [registry contract](https://github.com/EthTrader/dappening/blob/master/contracts/RedditRegistry.sol). A [simple dapp](https://ethtrader.github.io/) will help to submit data. Note: **self-registration will irreversibly and publically associate a Reddit username to an Ethereum address and any contracts or addresses that address has transacted with. new/fresh addresses are free to generate.**
1. [A humble plugin](https://github.com/EthTrader/plugin) adds an 'is-reg' class to registered usernames. On r/ethtrader this is currently used to change their text color to orange.

[The plugin](https://github.com/EthTrader/plugin) currently reads from a registry contract [deployed](https://rinkeby.etherscan.io/address/0x472805e20574d61f0e3c3814db55f246261d8c84) to rinkeby but is limited to data on r/ethtrader moderators. In the coming days I'd like to deploy a new rinkeby testnet contract. Anyone who wants to help test can check their karma and/or pre-register an address below. After some time (24-48hrs) I'll generate the merkle tree, publish the proofs and users will be able to register on the testnet [rinkeby] deployed contract.

-
-

**Some stats**

* [57,915] registerable users from r/ethereum, r/ethtrader, r/ethdev, and r/ethermining
* karma from 96,814 posts (1,959,963) and 1,876,562 comments (5,924,793) collected
