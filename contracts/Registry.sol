pragma solidity ^0.4.17;

import "./Controlled.sol";

contract Registry is Controlled {

    struct User {
        address                        owner;
        mapping(uint8 => uint)         values;
    }

    mapping(bytes20 => User)    public usernameToUser;
    mapping(address => bytes20) public ownerToUsername;

    bytes20[]                   public userValueNames;

    event Added(bytes20 username);
    event Removed(bytes20 username);

    function add(bytes20 _username, address _owner) public onlyController {
        usernameToUser[_username] = User({owner: _owner});
        ownerToUsername[_owner] = _username;
        Added(_username);
    }

    function remove(bytes20 _username) public onlyController {
        delete ownerToUsername[usernameToUser[_username].owner];
        delete usernameToUser[_username];
        Removed(_username);
    }

    function addUserValueName(bytes20 _valueName) public onlyController {
        userValueNames.push(_valueName);
    }

    function getOwner(bytes20 _username) public returns(address owner) {
        owner = usernameToUser[_username].owner;
    }

    function getUserValue(bytes20 _username, uint8 _valueIdx) public returns(uint value) {
        value = usernameToUser[_username].values[_valueIdx];
    }

}
