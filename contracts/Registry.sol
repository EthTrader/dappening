pragma solidity ^0.4.17;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";

contract Registry is Controlled {

    uint32 public constant collectedTill = 1506816000;
    uint public endowEnd;
    address public token;
    address public factory;

    bytes32[] public roots;

    mapping(address => bytes20) public addressToUsername;
    mapping(bytes20 => address) public usernameToAddress;

    event Registered(bytes20 username, address owner, uint endowment);

    function Registry(bytes32 _root, uint16 _endowDuration) {
        roots.push(_root);
        endowEnd = block.number + _endowDuration;
        factory = new MiniMeTokenFactory();
        token = new MiniMeToken(
            factory,
            0,// address _parentToken,
            0,// uint _snapshotBlock,
            "EthTrader Token",// string _tokenName,
            9,// uint8 _decimalUnits,
            "ETR",// string _tokenSymbol,
            false// bool _transfersEnabled
            );
    }

    function register(
        bytes20 _username,
        uint24 _endowment,
        uint32 _firstContent,
        bytes32[] proof,
        uint16 _rootIndex
    ) public {

        // only register address & username once
        require(addressToUsername[msg.sender] == 0 && usernameToAddress[_username] == 0);

        bytes32 hash = keccak256(msg.sender, _username, _endowment, _firstContent);

        require(MerkleTreeLib.checkProof(proof, roots[_rootIndex], hash));

        addressToUsername[msg.sender] = _username;
        usernameToAddress[_username] = msg.sender;

        if(block.number < endowEnd)
            MiniMeToken(token).generateTokens(msg.sender, _endowment);

        Registered(_username, msg.sender, _endowment);
    }

    function addRoot(bytes32 _root) public onlyController {
        roots.push(_root);
    }

    function enableTransfers() public {
        require(block.number >= endowEnd);
        MiniMeToken(token).enableTransfers(true);
    }

    function check(
        bytes20 _username,
        uint24 _endowment,
        uint32 _firstContent,
        bytes32[] proof,
        uint16 _rootIndex
    ) public view returns (bool, bytes32) {
        bytes32 hash = keccak256(msg.sender, _username, _endowment, _firstContent);
        return (MerkleTreeLib.checkProof(proof, roots[_rootIndex], hash), hash);
    }

}
