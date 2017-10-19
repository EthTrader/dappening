pragma solidity ^0.4.17;

library ActionLib {

    struct Values {
        mapping(bytes20 => uint) uints;
    }

    function run(Values storage votable) public {
        votable.uints["TEST_VALUE"] = 600;
    }
}
