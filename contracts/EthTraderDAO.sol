pragma solidity ^0.4.17;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";
import "./Voting.sol";

// is controller of Token, Registry
contract EthTraderDAO is Voting {

    /*actions "NONE", "UPGRADE", "ADD_ROOT", "TOGGLE_TRANSFERABLE", "TOGGLE_ENDOWABLE", "UPDATE_UINT"*/

    Registry                    public registry;
    MiniMeTokenFactory          public tokenFactory;
    MiniMeToken                 public token;
    bool                        public endowable = true;
    bytes32[]                   public roots;

    function EthTraderDAO(address _parent, bytes32 _root) {
        if(_parent == 0){
            roots.push(_root);
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

    /*function enableTransfers() internal {
        require(block.number >= endowEnd);
        token.enableTransfers(true);
    }*/

    function enactProp(uint _propIdx) public {
        Prop storage prop = props[_propIdx];

        if(!resolveProp(prop))
            return;

        if( prop.action == "UPGRADE" ) {
            upgrade(address(extract20(prop.data)));
        } else if( prop.action == "ADD_ROOT" ) {
            roots.push(prop.data);
        } else if( prop.action ==  "TOGGLE_TRANSFERABLE" ) {
            token.enableTransfers(!token.transfersEnabled());
        } else if( prop.action ==  "TOGGLE_ENDOWABLE" ) {
            endowable = !endowable;
        }
        /*else if( prop.action == "UPDATE_UINT") {
            var (key, val) = extractKV(prop.data);
            votableUINT[key] = somehowCoerceBytes12ToUINT(val);
        }*/
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

        if(endowable)
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
