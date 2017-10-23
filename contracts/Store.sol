pragma solidity ^0.4.17;

import "./Controlled.sol";

contract Store is Controlled {

    mapping(bytes20 => uint)    public values;

    event Set(bytes20 key, uint val);
    event Removed(bytes20 key);

    function set(bytes20 _key, uint _val) public onlyController {
        values[_key] = _val;
        Set(_key, _val);
    }

    function remove(bytes20 _key) public onlyController {
        delete values[_key];
        Removed(_key);
    }

}
