pragma solidity ^0.4.15;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";

contract RedditRegistry is TokenController {

    enum Subs { Ethereum, EthTrader, EthDev, EtherMining }

    struct User {
        bytes20 username;               // reddit username
        address owner;                  // ethereum address of user
        uint32 joined;                  // date user joined reddit, seconds since epoc
        int24[4] postScores;            // map sub to sub karma score
        int24[4] commentScores;         // map sub to sub karma score
        uint32[4] modStarts;            // map sub to date a mod started, seconds since epoc
    }

    uint8 public constant modDayRate = 10;
    uint public start;
    address public token;
    address public factory;
    bytes32 public root = 0x8d7e4caeec656911d9ee0afc00049a714187f7dd455008b48c19b5ba931de763;

    // List of all users, index = userId, enables looping through all users
    User[] public users;

    // Map owner address to user id
    mapping(address => uint) public ownerToIdx;

    // Map username to user id
    mapping(bytes20 => uint) public usernameToIdx;

    event Registered(uint userIdx, uint endowment);

    function RedditRegistry(bytes32 _root) {
        // initialise the 0 index user
        User memory user;
        users.push(user);
        root = _root;//0x8d7e4caeec656911d9ee0afc00049a714187f7dd455008b48c19b5ba931de763;
        start = block.timestamp;
        factory = new MiniMeTokenFactory();
        token = new MiniMeToken(
            factory,
            0,// address _parentToken,
            0,// uint _snapshotBlock,
            "Reddit Ethereum Community Token",// string _tokenName,
            9,// uint8 _decimalUnits,
            "RECT",// string _tokenSymbol,
            false// bool _transfersEnabled
            );
    }

    function register(
        bytes20 _username,
        uint32 _joined,
        int24[4] _postScores,
        int24[4] _commentScores,
        uint32[4] _modStarts,
        bytes32[] proof
    ) public {

        // only register address once
        require(ownerToIdx[msg.sender] == 0);
        // only register username once
        require(usernameToIdx[_username] == 0);

        bytes32 hash = keccak256(msg.sender, _username, _joined, _postScores, _commentScores, _modStarts);

        require(MerkleTreeLib.checkProof(proof, root, hash));

        User memory user = User({
            username: _username,
            owner: msg.sender,
            joined: _joined,
            postScores: _postScores,
            commentScores: _commentScores,
            modStarts: _modStarts
        });

        uint userIdx = users.push(user) - 1;

        ownerToIdx[msg.sender] = userIdx;
        usernameToIdx[_username] = userIdx;
        Registered(userIdx, endow(user));
    }

    function endow(User user) internal returns (uint endowment){
        int _endowment = 0;
        endowment = 0;
        for (uint i = 0; i < user.postScores.length; i++) {
            _endowment += user.postScores[i];
        }
        for (uint j = 0; j < user.commentScores.length; j++) {
            _endowment += user.commentScores[j];
        }
        if(_endowment > 0) endowment = uint(_endowment);
        uint modStartMax = 0;
        for (uint k = 0; k < user.modStarts.length; k++) {
            if(user.modStarts[k] > modStartMax) modStartMax = user.modStarts[k];
        }
        if(modStartMax > start) {
            endowment += (modStartMax-start)*modDayRate / 1 days;
        }
        MiniMeToken(token).generateTokens(user.owner, endowment);
    }

    function onTransfer(address _from, address _to, uint _amount) returns(bool) {
        return true;
    }

    function onApprove(address _owner, address _spender, uint _amount) returns(bool) {
        return true;
    }

    function check(
        bytes20 _username,
        uint32 _joined,
        int24[4] _postScores,
        int24[4] _commentScores,
        uint32[4] _modStarts,
        bytes32[] proof
    ) public constant returns (bool) {
        bytes32 hash = keccak256(msg.sender, _username, _joined, _postScores, _commentScores, _modStarts);

        return MerkleTreeLib.checkProof(proof, root, hash);
    }

    function getUserByUsername(bytes20 _username) public constant returns (bytes20 username, address owner, uint32 joined, int24[4] postScores, int24[4] commentScores, uint32[4] modStarts) {
        User storage user = users[usernameToIdx[_username]];
        return (user.username, user.owner, user.joined, user.postScores, user.commentScores, user.modStarts);
    }

    // playing with the batch idea as a way to expedite retrieving data from a third party hosted blockchian like Infura
    // i'm not sure what the best batch size would be here

    function getIdxBatchByUsername(bytes20[] _usernames) public constant returns (uint[20] registered) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            registered[i] = usernameToIdx[_usernames[i]];
        }
    }

    function getAddressBatchByUsername(bytes20[] _usernames) public constant returns (address[20] addresses) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            addresses[i] = users[usernameToIdx[_usernames[i]]].owner;
        }
    }

    function getSubScoreBatchByUsername(uint subIdx, bytes20[] _usernames) public constant returns (int[20] scores) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            User storage user = users[usernameToIdx[_usernames[i]]];
            scores[i] = user.postScores[subIdx] + user.commentScores[subIdx];
        }
    }

}
