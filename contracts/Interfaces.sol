pragma solidity ^0.4.19;

contract IControlled {
  function controller() public constant returns(address);
  function changeController(address _newController) public;
}

contract IRegistry is IControlled {

  /* struct User {
      address                     owner;
      uint32                      karma;
      uint32                      firstContentAt;
      uint16                      lastRootIndex;
  }

  function usernameToUser(bytes20 _username) public constant returns(User); */
  function ownerToUsername(address _owner) public constant returns(bytes20);
  function add(bytes20 _username, address _owner, uint32 _karma, uint32 _firstContentAt, uint16 _rootIndex) public;
  function update(bytes20 _username, address _owner, uint32 _karma, uint16 _rootIndex) public;
  function remove(bytes20 _username) public;
  function getOwner(bytes20 _username) public returns(address);
  function getKarma(bytes20 _username) public view returns(uint32);
  function getFirstContentAt(bytes20 _username) public returns(uint32);
  function getLastRootIndex(bytes20 _username) public returns(uint16);

}

contract IToken is IControlled {

  struct  Checkpoint {
      uint128 fromBlock;
      uint128 value;
  }

  function name() public constant returns(string);
  function decimals() public constant returns(uint8);
  function symbol() public constant returns(string);
  function parentToken() public constant returns(IToken);
  function parentSnapShotBlock() public constant returns(uint);
  function creationBlock() public constant returns(uint);
  function transfersEnabled() public constant returns(bool);
  function tokenFactory() public constant returns(ITokenFactory);
  function transfer(address _to, uint256 _amount) public returns (bool success);
  function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success);
  function balances(address _owner) public view returns (Checkpoint[]);
  function getCheckpointCount(address _owner) public view returns (uint);
  function getCheckpoint(address _owner, uint _index) public view returns (Checkpoint);
  function balanceOf(address _owner) public returns (uint256 balance);
  function approve(address _spender, uint256 _amount) public returns (bool success);
  function allowance(address _owner, address _spender) public returns (uint256 remaining);
  function approveAndCall(address _spender, uint256 _amount, bytes _extraData) public returns (bool success);
  function totalSupply() public returns (uint);
  function balanceOfAt(address _owner, uint _blockNumber) public returns (uint);
  function totalSupplyAt(uint _blockNumber) public returns(uint);
  function createCloneToken(
        string _cloneTokenName,
        uint8 _cloneDecimalUnits,
        string _cloneTokenSymbol,
        uint _snapshotBlock,
        bool _transfersEnabled) public returns(address);
  function generateTokens(address _owner, uint _amount) public returns (bool);
  function destroyTokens(address _owner, uint _amount) public returns (bool);
  function enableTransfers(bool _transfersEnabled) public;
}

contract ITokenFactory {
  function createCloneToken(
        address _parentToken,
        uint _snapshotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled) public returns (IToken);
}
