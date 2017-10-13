pragma solidity ^0.4.17;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";

contract Registry is Controlled {

    struct User {
        bytes20 username;               // reddit username
        address owner;                  // ethereum address of user
        uint32 joined;                  // date user joined reddit, seconds since epoc
        int24[] postScores;            // map sub to sub karma score
        int24[] commentScores;         // map sub to sub karma score
        uint32[] modStarts;            // map sub to date a mod started, seconds since epoc
        uint16 rootIndex;
    }

    uint8 public modDayRate;
    uint32 public constant collectedTill = 1506816000;
    uint public endowEnd;
    address public token;
    address public factory;

    User[] public users;
    bytes32[] public roots;
    bytes20[] public subreddits;

    mapping(address => uint) public ownerToIndex;
    mapping(bytes20 => uint) public usernameToIndex;

    event Registered(uint userIndex, uint endowment);

    function Registry(bytes32 _root, uint8 _modDayRate, uint16 _endowDuration, bytes20[] _subreddits) {
        // initialise the 0 index user
        User memory user;
        users.push(user);
        roots.push(_root);
        modDayRate = _modDayRate;
        endowEnd = block.number + _endowDuration;
        subreddits = _subreddits;
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
        int24[] _postScores,
        int24[] _commentScores,
        uint32[] _modStarts,
        bytes32[] proof,
        uint16 _rootIndex
    ) public {

        // only register address once
        require(ownerToIndex[msg.sender] == 0);
        // only register username once
        require(usernameToIndex[_username] == 0);

        bytes32 hash = keccak256(msg.sender, _username, _joined, _postScores, _commentScores, _modStarts);

        require(MerkleTreeLib.checkProof(proof, roots[_rootIndex], hash));

        User memory user = User({
            username: _username,
            owner: msg.sender,
            joined: _joined,
            postScores: _postScores,
            commentScores: _commentScores,
            modStarts: _modStarts,
            rootIndex: _rootIndex
        });

        uint userIndex = users.push(user) - 1;

        ownerToIndex[msg.sender] = userIndex;
        usernameToIndex[_username] = userIndex;

        uint endowment = 0;
        if(block.number < endowEnd)
            endowment = endow(user);

        Registered(userIndex, endowment);
    }

    function addRoot(bytes32 _root) public onlyController {
        roots.push(_root);
    }

    function addSubreddit(bytes20 _subreddit) public onlyController {
        subreddits.push(_subreddit);
    }

    function enableTransfers() public {
        require(block.number >= endowEnd);
        MiniMeToken(token).enableTransfers(true);
    }

    function endow(User user) internal returns (uint endowment){
        int _endowment = 0;
        endowment = 0;

        for (uint i = 0; i < user.postScores.length; i++)
            _endowment += user.postScores[i];

        for (uint j = 0; j < user.commentScores.length; j++)
            _endowment += user.commentScores[j];

        if(_endowment > 0)
            endowment = uint(_endowment);

        uint modStartMax = 0;
        for (uint k = 0; k < user.modStarts.length; k++) {
            if(user.modStarts[k] > 0 && (modStartMax == 0 || user.modStarts[k] < modStartMax))
                modStartMax = user.modStarts[k];
        }

        if(modStartMax > 0 && modStartMax < collectedTill)
            endowment += (collectedTill - modStartMax) * modDayRate / 1 days;

        MiniMeToken(token).generateTokens(user.owner, endowment);
    }

    function check(
        bytes20 _username,
        uint32 _joined,
        int24[] _postScores,
        int24[] _commentScores,
        uint32[] _modStarts,
        bytes32[] proof,
        uint16 _rootIndex
    ) public view returns (bool, bytes32) {
        bytes32 hash = keccak256(msg.sender, _username, _joined, _postScores, _commentScores, _modStarts);
        return (MerkleTreeLib.checkProof(proof, roots[_rootIndex], hash), hash);
    }
    
}
