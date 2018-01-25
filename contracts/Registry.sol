pragma solidity ^0.4.17;

import "./Controlled.sol";

contract Registry is Controlled {

    struct User {
        address                     owner;
        uint32                      firstContentAt;
    }

    mapping(bytes20 => User)    public usernameToUser;
    mapping(address => bytes20) public ownerToUsername;

    event Added(bytes20 username);
    event Removed(bytes20 username);

    function add(bytes20 _username, address _owner, uint32 _firstContentAt) public onlyController {
        usernameToUser[_username] = User({owner: _owner, firstContentAt: _firstContentAt});
        ownerToUsername[_owner] = _username;
        Added(_username);
    }

    function remove(bytes20 _username) public onlyController {
        delete ownerToUsername[usernameToUser[_username].owner];
        delete usernameToUser[_username];
        Removed(_username);
    }

    function getOwner(bytes20 _username) public view returns(address owner) {
        owner = usernameToUser[_username].owner;
    }

    function getFirstContentAt(bytes20 _username) public view returns(address owner) {
        owner = usernameToUser[_username].owner;
    }

}
