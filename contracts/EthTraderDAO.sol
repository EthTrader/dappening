pragma solidity ^0.4.17;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";
import "./Voting.sol";

// is controller of Token, Registry
contract EthTraderDAO is Voting {

    Registry                    public registry;
    MiniMeTokenFactory          public tokenFactory;
    MiniMeToken                 public token;
    uint                        public endowEnd;
    bytes32[]                   public roots;

    function EthTraderDAO(address _parent, bytes32 _root, uint16 _endowDuration) {
        if(_parent == 0){
            roots.push(_root);
            endowEnd = block.number + _endowDuration;
            registry = new Registry();
            tokenFactory = new MiniMeTokenFactory();
            token = new MiniMeToken(
                tokenFactory,
                0,// address _parentToken,
                0,// uint _snapshotBlock,
                "EthTrader Token",// string _tokenName,
                9,// uint8 _decimalUnits,
                "ETR",// string _tokenSymbol,
                false// bool _transfersEnabled
                );
        } else {
            EthTraderDAO parentDAO = EthTraderDAO(_parent);
            reset(address(parentDAO.registry), address(parentDAO.tokenFactory), address(parentDAO.token));
        }
    }

    function enableTransfers() public {
        require(block.number >= endowEnd);
        token.enableTransfers(true);
    }

    function reset(address _registry, address _tokenFactory, address _token) internal {
        registry = Registry(_registry);
        tokenFactory = MiniMeTokenFactory(_tokenFactory);
        token = MiniMeToken(_token);
    }

    function upgrade(address _newController) internal {
        registry.changeController(_newController);
        token.changeController(_newController);
    }

    function register(
        bytes20 _username,
        uint24 _endowment,
        uint32 _firstContent,
        bytes32[] _proof,
        uint16 _rootIndex
    ) public {
        require(
            registry.addressToUsername(msg.sender) == 0 &&
            registry.usernameToAddress(_username) == 0 &&
            validate(_username, _endowment, _firstContent, _proof, _rootIndex)
            );

        registry.add(_username, msg.sender);

        if(block.number < endowEnd)
            token.generateTokens(msg.sender, _endowment);
    }

    function validate(
        bytes20 _username,
        uint24 _endowment,
        uint32 _firstContent,
        bytes32[] _proof,
        uint16 _rootIndex
    ) public view returns (bool) {
        bytes32 hash = keccak256(msg.sender, _username, _endowment, _firstContent);
        return MerkleTreeLib.checkProof(_proof, roots[_rootIndex], hash);
    }

}
