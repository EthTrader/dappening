pragma solidity ^0.4.19;

import "./Controlled.sol";

contract Registry is Controlled {

    struct User {
        address                     owner;
        uint32                      karma;
        uint32                      firstContentAt;
        uint16                      lastRootIndex;
    }

    mapping(bytes20 => User)    public usernameToUser;
    mapping(address => bytes20) public ownerToUsername;

    event Added(bytes20 username);
    event Updated(bytes20 username);
    event Removed(bytes20 username);

    function add(bytes20 _username, address _owner, uint32 _karma, uint32 _firstContentAt, uint16 _rootIndex) public onlyController {
        usernameToUser[_username] = User({
          owner: _owner,
          karma: _karma,
          firstContentAt: _firstContentAt,
          lastRootIndex: _rootIndex
        });
        ownerToUsername[_owner] = _username;

        Added(_username);
    }

    function update(bytes20 _username, address _owner, uint32 _karma, uint16 _rootIndex) public onlyController {
        // username should exist
        // if owner is diff, then
        usernameToUser[_username].karma = _karma;
        usernameToUser[_username].lastRootIndex = _rootIndex;

        if(_owner != usernameToUser[_username].owner) {
            delete ownerToUsername[_owner];
            ownerToUsername[_owner] = _username;
            usernameToUser[_username].owner = _owner;
        }

        Updated(_username);
    }

    function remove(bytes20 _username) public onlyController {
        delete ownerToUsername[usernameToUser[_username].owner];
        delete usernameToUser[_username];
        Removed(_username);
    }

    function getOwner(bytes20 _username) public view returns(address owner) {
        owner = usernameToUser[_username].owner;
    }

    function getKarma(bytes20 _username) public view returns(uint32 karma) {
        karma = usernameToUser[_username].karma;
    }

    function getFirstContentAt(bytes20 _username) public view returns(uint32 firstContentAt) {
        firstContentAt = usernameToUser[_username].firstContentAt;
    }

    function getLastRootIndex(bytes20 _username) public view returns(uint16 rootIndex) {
        rootIndex = usernameToUser[_username].lastRootIndex;
    }

}
