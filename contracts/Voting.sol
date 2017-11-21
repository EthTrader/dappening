pragma solidity ^0.4.17;

import "./MiniMeToken.sol";
// import "./Registry.sol";
import "./Interfaces.sol";
// import "./Store.sol";
// import "./EthTraderLib.sol";

contract Voting {

    enum PropState                  { UNRESOLVED, PASSED, FAILED, ENDED }

    struct Prop {
        bytes20                     action;
        bytes32                     data;
        PropState                   state;
        uint                        startedAt;
        uint                        lastSigVoteAt;
        bytes20                     author;
        uint                        stake;
        mapping(uint => uint)       results;
        mapping(address => bool)    voted;
    }

    bytes20[]                       public actions = [bytes20("NONE")];
    IStore                          public store;
    IRegistry                        public registry;
    IMiniMeToken                     public token;
    Prop[]                          public props;

    event Proposed(uint propIdx);
    event Voted(bytes20 username, uint propIdx, uint prefIdx);
    event Resolved(uint propIdx, bool result);

    function addProp(bytes20 _action, bytes32 _data) public {
        bytes20 username = registry.ownerToUsername(msg.sender);
        require( username != 0 );

        Prop memory prop;

        if(_action == actions[0]) {                                             // is "NONE" action, treat as poll
            require( token.destroyTokens(msg.sender, store.values("POLL_COST")) );
        } else {
            prop.stake = store.values("PROP_STAKE");
            require( token.transferFrom(msg.sender, 1, prop.stake) );
        }

        prop.action = _action;
        prop.data = _data;
        prop.startedAt = block.number;
        prop.author = username;

        Proposed(props.push(prop)-1);
    }

    function resolveProp(Prop storage _prop) internal returns(bool) {
        require(
            _prop.state   == PropState.UNRESOLVED &&
            block.number >= _prop.lastSigVoteAt + store.values("SIG_VOTE_DELAY") &&
            block.number >= _prop.startedAt + store.values("PROP_DURATION")
            );

        if(_prop.action == actions[0]) {                                        // is "NONE" action
            _prop.state = PropState.ENDED;
            return true;
        } else {
            if(_prop.results[1]/2 > _prop.results[0]) {                             // need 2/3 majority to pass
                _prop.state = PropState.PASSED;
                // return staked tokens
                require( token.transferFrom(1, registry.getOwner(_prop.author), _prop.stake) );
                return true;
            } else {
                _prop.state = PropState.FAILED;
                // burn staked tokens
                require( token.destroyTokens(1, _prop.stake) );
                return false;
            }
        }
    }

    function endPoll(uint _propIdx) public {
        Prop storage prop = props[_propIdx];
        require( prop.action == actions[0] );
        resolveProp(prop);
    }

    function getResult(uint _propIdx, uint _prefIdx) public view returns (uint) {
        Prop storage prop = props[_propIdx];
        return prop.results[_prefIdx];
    }

    function getWeightedVote(bytes20 _username, uint _propIdx) public view returns (uint) {        // override this method in DAO
        Prop storage prop = props[_propIdx];
        return token.balanceOfAt(msg.sender, prop.startedAt);
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

        uint weightedVote = getWeightedVote(username, _propIdx);
        if(weightedVote >= store.values("SIG_VOTE"))
            prop.lastSigVoteAt = block.number;
        prop.results[_prefIdx] += weightedVote;
        prop.voted[msg.sender] = true;
        Voted(username, _propIdx, _prefIdx);
    }
}
