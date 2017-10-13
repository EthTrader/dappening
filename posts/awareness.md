Hi, I'm a moderator for r/EthTrader. A little over a month ago I [posted](https://www.reddit.com/r/ethtrader/comments/72scaj/ethtrader_the_dappening/) about a proposal r/EthTrader mods had been discussing. In a nutshell: to register Ethereum/Reddit users in a smart contract and distribute a token based on their karma earned in the sub and mod time.

Why

*
* Subreddit governance
*

How

* All post and comment karma earned through 30/9/2017 counted at equal ratios
* 2.5% of total to mods, distributed based on time as mod
* no endowment after endowment period ends, but still allow registrations
* admin can add new merkle root. merkle root index stored along with updates and new registrations.
* collect addresses during pre-registration, generate merkle root & proofs, publish contract & proofs
* self-registration with merkle tree validation
* after set registration period (1 week, `regEndBlock`), can call enableTransfers on registry (minime controller)
