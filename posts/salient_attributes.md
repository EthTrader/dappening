EthTrader Token & DAO: Salient features

Sorry for the [FULL PING] but please review the following before I post it to the sub.

Following on from [previous](https://www.reddit.com/r/ethtrader/comments/72scaj/ethtrader_the_dappening/) [posts](https://www.reddit.com/r/EthTraderAdmin/comments/74fo24/dappening_progressdemo/) I'd like to describe the current state of [development](https://github.com/EthTrader/dappening) for the EthTrader DAO and Token, and open up the choices to further discussion and feedback.

The EthTrader Token and username Registry are designed to be fully self governed by the EthTrader DAO. What is presented here, and the code in the repo, is largely to support that self governance at a fairly basic level. **All choices presented here up for discussion and review**.

-
-

**Token Distribution**

* tokens are generated & endowed when users register their username with the DAO. To be eligible, users must have pre-registered the Ethereum address they will use.
* token endowment is based on combined post and comment karma from r/ethtrader, r/ethereum, r/ethdev, and r/ethermining until 30/09/2017 (already collected)
* an additional endowment (2.5% of total) is available to r/ethtrader mods, distributed based on their number of days as mod until 30/09/2017

-
-

**DAO Operation**

* Proposals are submitted by registered users along with a token stake (PROP_STAKE) that is burned if the proposal fails.
* Proposals can be enacted following a 2/3 majority vote.
* Voting is eligible to registered token holders and is weighted by token amount and token age.
* Initial token age is established by the date of the users first comment or post.
* An amount (TOKEN_AGE_DAY_CAP) can be transferred each day without affecting token age. Exceeding this amount within a day sets the token age to the current date.
* Proposals last a preset time (PROP_DURATION), but the end can be delayed (SIG_VOTE_DELAY) if a vote above a certain threshold amount (SIG_VOTE) has occurred.
* The following actions can be performed by voting:
    * UPGRADE - upgrade the DAO/controller contract
    * ADD_ROOT - adding a merkle root opens registration up to a new set of users
    * TOGGLE_TRANSFERABLE - toggle transferability of tokens
    * TOGGLE_REG_ENDOW - toggle endowment during registration
    * SET_VALUE - update one of the following values (or a new value used in a future contract)
        * PROP_STAKE - amount of tokens to be staked in order to submit a proposal
        * SIG_VOTE - threshold weighted vote amount that would cause a delay to ending a proposal
        * SIG_VOTE_DELAY - (in blocks) the length of time a "significant vote" would delay ending a proposal
        * PROP_DURATION - (in blocks) the duration for proposals
        * TOKEN_AGE_DAY_CAP - max amount that can be transferred each day without resetting token age
    * ENDOW - direct endow tokens to an address
