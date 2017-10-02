pragma experimental "v0.5.0";
contract RedditRegistry {

    enum Subs { Ethereum, EthTrader, EthDev, EtherMining }

    struct User {
        bytes20 username;               // reddit username
        address owner;                  // ethereum address of user
        uint joined;                    // date user joined reddit
        uint[4] postScores;             // map sub to sub karma score
        uint[4] commentScores;          // map sub to sub karma score
        uint[4] modStarts;              // map sub to date a mod started
    }

    // List of all users, index = userId, enables looping through all users
    User[] public users;

    // Map owner address to user id
    mapping(address => uint) public userIdxFromOwner;

    // Map username to user id
    mapping(bytes20 => uint) public userIdxFromUsername;

    event UserRegistered(uint userIdx);

    function RedditRegistry() {
        // initialise the 0 index user
        User memory user;
        users.push(user);
    }

    // "carlslarson", 1403190201000, [756,3056,0,0], [216,1688,0,0], [0,1427295310000,0,0]

    modifier validated {
        // some validation scheme here
        _;
    }

    function register(bytes20 _username, uint _joined, uint[4] _postScores, uint[4] _commentScores, uint[4] _modStarts) public validated {
        uint userIdx = users.push(User({
            username: _username,
            owner: msg.sender,
            joined: _joined,
            postScores: _postScores,
            commentScores: _commentScores,
            modStarts: _modStarts
        })) - 1;
        userIdxFromOwner[msg.sender] = userIdx;
        userIdxFromUsername[_username] = userIdx;
        UserRegistered(userIdx);
    }

    function getUserByUsername(bytes20 _username) public returns (bytes20 username, address owner, uint joined, uint[4] postScores, uint[4] commentScores, uint[4] modStarts) {
        User user = users[userIdxFromUsername[_username]];
        return (user.username, user.owner, user.joined, user.postScores, user.commentScores, user.modStarts);
    }

    // playing with the batch idea as a way to expedite retrieving data from a third party hosted blockchian like Infura
    // i'm not sure what the best batch size would be here

    function getIdxBatchByUsername(bytes20[] _usernames) public returns (uint[20] registered) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            registered[i] = userIdxFromUsername[_usernames[i]];
        }
    }

    function getAddressBatchByUsername(bytes20[] _usernames) public returns (address[20] addresses) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            addresses[i] = users[userIdxFromUsername[_usernames[i]]].owner;
        }
    }

    function getSubScoreBatchByUsername(uint subIdx, bytes20[] _usernames) public returns (uint[20] scores) {
        require(_usernames.length <= 20);
        for (uint i = 0; i < _usernames.length; i++) {
            User user = users[userIdxFromUsername[_usernames[i]]];
            scores[i] = user.postScores[subIdx] + user.commentScores[subIdx];
        }
    }

}
