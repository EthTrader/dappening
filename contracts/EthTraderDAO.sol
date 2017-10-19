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

}
