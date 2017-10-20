pragma solidity ^0.4.17;

import "./MiniMeToken.sol";
import "./Registry.sol";

contract Voting {

    struct Prop {
        bytes20                     username;
        MiniMeToken                 token;
        uint startedAt;
        uint lastSigVoteAt;
        uint[] results;
        mapping(address => bool)    voted;
    }

    Registry                        public registry;
    MiniMeTokenFactory              public tokenFactory;
    MiniMeToken                     public token;
    uint                            public sigVote = 500;
    uint                            public sigVoteDelay = 43;
    uint                            public propDuration = 43200;
    Prop[]                          public props;

    event Proposed(bytes20 username, uint propIdx);
    event Voted(bytes20 username, uint propIdx, uint prefIdx);

    function addProp(string _name, string _symbol) public {
        // TODO - ensure sufficient "stake"

        bytes20 username = registry.addressToUsername(msg.sender);
        require(username != "0x");

        Prop memory prop;

        prop.username = username;
        prop.token = tokenFactory.createCloneToken(
            token,
            block.number,
            _name,
            token.decimals(),
            _symbol,
            false
            );
        prop.startedAt = block.number;

        Proposed(username, props.push(prop)-1);
    }

    function resolveProp(uint _propIdx) public {
        Prop storage prop = props[_propIdx];

        require(
            block.number >= prop.lastSigVoteAt + sigVoteDelay &&
            block.number >= prop.startedAt + propDuration
            );

        require(prop.results[1]/2 > prop.results[0]);                           // need 2/3 majority to pass
    }

    function vote(uint _propIdx, uint _prefIdx) public {

        bytes20 username = registry.addressToUsername(msg.sender);
        require(username != "0x");

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
}
