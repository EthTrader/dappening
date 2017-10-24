pragma solidity ^0.4.17;

import "./MiniMeToken.sol";
import "./Registry.sol";
import "./Store.sol";

contract Voting {

    enum PropState                  { UNRESOLVED, PASS, FAIL }

    struct Prop {
        bytes20                     action;
        bytes32                     data;
        PropState                   state;
        uint                        startedAt;
        uint                        lastSigVoteAt;
        bytes20                     author;
        mapping(uint => uint)       results;
        mapping(address => bool)    voted;
        MiniMeToken                 token;
    }

    bool                            public isDev;
    Store                           public store;
    Registry                        public registry;
    MiniMeTokenFactory              public tokenFactory;
    MiniMeToken                     public token;
    Prop[]                          public props;

    event Proposed(uint propIdx);
    event Voted(bytes20 username, uint propIdx, uint prefIdx);

    function addProp(bytes20 _action, bytes32 _data) public {
        // TODO - ensure sufficient "stake"
        bytes20 username = registry.ownerToUsername(msg.sender);
        require( username != 0 );

        Prop memory prop;
        prop.action = _action;
        prop.data = _data;
        prop.startedAt = block.number;
        prop.author = username;
        prop.token = tokenFactory.createCloneToken(
            address(token),
            block.number,
            "EthTrader Vote",
            token.decimals(),
            "ETR_VOTE",
            false
            );

        Proposed(props.push(prop)-1);
    }

    function resolveProp(Prop storage _prop) internal returns(bool) {
        require(
            _prop.state   == PropState.UNRESOLVED &&
            block.number >= _prop.lastSigVoteAt + store.values("SIG_VOTE_DELAY") &&
            block.number >= _prop.startedAt + store.values("PROP_DURATION")
            );

        if(_prop.results[1]/2 > _prop.results[0]) {                               // need 2/3 majority to pass
            _prop.state = PropState.PASS;
            return true;
        } else {
            _prop.state = PropState.FAIL;
            return false;
        }
    }

    function vote(uint _propIdx, uint _prefIdx) public {
        bytes20 username = registry.ownerToUsername(msg.sender);
        require( username != 0 );

        Prop storage prop = props[_propIdx];

        require(prop.voted[msg.sender] == false);                               // didn't already vote
        require(                                                                // prop still active
            block.number < prop.startedAt + store.values("PROP_DURATION") ||
            block.number < prop.lastSigVoteAt + store.values("SIG_VOTE_DELAY")
            );

        uint weightedVote = prop.token.balanceOf(msg.sender);                   // TODO - add time component to weight
        if(weightedVote >= store.values("SIG_VOTE"))
            prop.lastSigVoteAt = block.number;
        prop.results[_prefIdx] += weightedVote;
        prop.voted[msg.sender] = true;
        Voted(username, _propIdx, _prefIdx);
    }

    function split32_20_12(bytes32 data) public pure returns (bytes20 twenty, bytes12 twelve) {
        twenty=extract20(data);
        for (uint i=20; i<32; i++)
            twelve^=(bytes12(0xff0000000000000000000000)&data[i])>>((i-20)*8);
    }

    function extract20(bytes32 data) public pure returns (bytes20 result) {
        for (uint i=0; i<20; i++)
            result^=(bytes20(0xff00000000000000000000000000000000000000)&data[i])>>(i*8);
    }
}
