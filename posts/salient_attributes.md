EthTrader Token & DAO

Sorry for the [PING ALL] but please review the following before I post it to the sub.

Following on from [previous](https://www.reddit.com/r/ethtrader/comments/72scaj/ethtrader_the_dappening/) [posts](https://www.reddit.com/r/EthTraderAdmin/comments/74fo24/dappening_progressdemo/) regarding the EthTrader token project, or dappening, this top line overview is intended to solicit feedback on how the EthTrader DAO and token will work as they have currently been [developed](https://github.com/EthTrader/dappening). For more details and technical explanations please ask in the comments.

**Token Distribution**

* tokens are generated & endowed when users register their username with the DAO. To be eligible, users must have pre-registered the Ethereum address they will use.
* token endowment is based on combined post and comment karma from r/ethtrader, r/ethereum, r/ethdev, and r/ethermining until 30/09/2017
* an additional endowment (2.5% of total) is available to r/ethtrader mods, distributed based on their number of days as mod until 30/09/2017

-
-

**DAO Operation**

* Proposals are submitted with a token stake that is burned if the proposal fails (not yet implemented).
* Proposals can be enacted following a 2/3 majority vote.
* Voting is eligible to registered token holders and is weighted by token amount and token age.
* Initial token age is established by the date of the users first comment or post.
* TOKEN_AGE_DAY_CAP amount can be transferred each day without affecting token age. Exceeding TOKEN_AGE_DAY_CAP within a day sets the token age to the current date.
* Proposals last PROP_DURATION time or until SIG_VOTE_DELAY if a vote of amount SIG_VOTE has occurred.
* The following actions can be performed by voting:
    * UPGRADE - upgrade the DAO/controller contract
    * ADD_ROOT - adding a merkle root opens registration up to a new set of users
    * TOGGLE_TRANSFERABLE - toggle transferability of tokens
    * TOGGLE_REG_ENDOW - toggle endowment during registration
    * SET_VALUE - update one of the following values (or a new value used in a future contract)
        * SIG_VOTE - threshold weighted vote amount that would cause a delay to ending a proposal
        * SIG_VOTE_DELAY - (in blocks) the length of time a "significant vote" would delay ending a proposal
        * PROP_DURATION - (in blocks) the duration for proposals
        * TOKEN_AGE_DAY_CAP - max amount that can be transferred each day without resetting token age
    * ENDOW - direct endow tokens to an address
