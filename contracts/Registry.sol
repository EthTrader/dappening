pragma solidity ^0.4.17;

import "./Controlled.sol";

contract Registry is Controlled {

    mapping(address => bytes20) public addressToUsername;
    mapping(bytes20 => address) public usernameToAddress;

    event Added(bytes20 username, address owner);
    event Removed(bytes20 username, address owner);

    function add(bytes20 _username, address _owner) public onlyController {
        addressToUsername[_owner] = _username;
        usernameToAddress[_username] = _owner;
        Added(_username, _owner);
    }

    function remove(bytes20 _username, address _owner) public onlyController {
        delete addressToUsername[_owner];
        delete usernameToAddress[_username];
        Removed(_username, _owner);
    }

}
