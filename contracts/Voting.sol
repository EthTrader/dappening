pragma solidity ^0.4.17;

import "./MiniMeToken.sol";
import "./Registry.sol";

contract Voting {

    enum PropState                  { UNRESOLVED, PASS, FAIL }

    struct Prop {
        bytes20                     action;
        PropState                   state;
        bytes32                     data;
        uint                        startedAt;
        MiniMeToken                 token;
        bytes20                     author;
        uint                        lastSigVoteAt;
        uint[]                      results;
        mapping(address => bool)    voted;
    }

    Registry                        public registry;
    MiniMeTokenFactory              public tokenFactory;
    MiniMeToken                     public token;
    uint                            public sigVote = 500;
    uint                            public sigVoteDelay = 43;
    uint                            public propDuration = 43200;
    Prop[]                          public props;

    event Proposed(uint propIdx);
    event Voted(bytes20 username, uint propIdx, uint prefIdx);

    function addProp(bytes20 _action, bytes32 _data) public {
        // TODO - ensure sufficient "stake"

        bytes20 username = registry.addressToUsername(msg.sender);
        require(username != "0x");                                              // only registered accounts

        Prop memory prop;

        prop.action = _action;
        prop.data = _data;
        prop.author = username;
        prop.token = tokenFactory.createCloneToken(
            token,
            block.number,
            "EthTrader Vote",
            token.decimals(),
            "ETR_VOTE",
            false
            );
        prop.startedAt = block.number;

        Proposed(props.push(prop)-1);
    }

    function resolveProp(Prop _prop) internal returns(bool) {
        require(
            _prop.state   == PropState.UNRESOLVED &&
            block.number >= _prop.lastSigVoteAt + sigVoteDelay &&
            block.number >= _prop.startedAt + propDuration
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

        bytes20 username = registry.addressToUsername(msg.sender);
        require(username != "0x");                                              // only registered accounts

        Prop storage prop = props[_propIdx];

        require(prop.voted[msg.sender] == false);                               // didn't already vote
        require(                                                                // prop still active
            block.number < prop.startedAt + propDuration ||
            block.number < prop.lastSigVoteAt + sigVoteDelay
            );

        uint weightedVote = prop.token.balanceOf(msg.sender);                   // TODO - add time component to weight
        if(weightedVote >= sigVote)
            prop.lastSigVoteAt = block.number;
        prop.results[_prefIdx] += weightedVote;
        prop.voted[msg.sender] == true;
        Voted(username, _propIdx, _prefIdx);
    }

    function extractKV(bytes32 data) public pure returns (bytes20 key, bytes12 val) {
        key=extract20(data);
        for (uint i=20; i<32; i++)
            val^=(bytes12(0xff0000000000000000000000)&data[i])>>(i*8);
    }

    function extract20(bytes32 data) public pure returns (bytes20 result) {
        for (uint i=0; i<20; i++)
            result^=(bytes20(0xff00000000000000000000000000000000000000)&data[i])>>(i*8);
    }
}
