pragma solidity ^0.4.17;

import "./Controlled.sol";

contract Registry is Controlled {

    mapping(address => bytes20) public addressToUsername;
    mapping(bytes20 => address) public usernameToAddress;

    event Added(bytes20 username, address owner);
    event Removed(bytes20 username, address owner);

    function add(bytes20 _username) public onlyController {
        addressToUsername[msg.sender] = _username;
        usernameToAddress[_username] = msg.sender;
        Added(_username, msg.sender);
    }

    function remove(bytes20 _username) public onlyController {
        delete addressToUsername[msg.sender];
        delete usernameToAddress[_username];
        Removed(_username, msg.sender);
    }

}
