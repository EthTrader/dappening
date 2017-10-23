pragma solidity ^0.4.17;

import "./MerkleTreeLib.sol";
import "./MiniMeToken.sol";
import "./Voting.sol";
import "./Store.sol";

// is controller of Token, Registry
contract EthTraderDAO is Voting {

    bool                        public regEndow = true;
    bytes32[]                   public roots;
    bytes20[]                   public actions = [bytes20("NONE"), bytes20("UPGRADE"), bytes20("ADD_ROOT"), bytes20("TOGGLE_TRANSFERABLE"), bytes20("TOGGLE_REG_ENDOW"), bytes20("SET_VALUE"), bytes20("ENDOW")];
    mapping(bytes20 => uint)    public votableValues;

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
            store = new Store();
            store.set("SIG_VOTE", 500);
            store.set("SIG_VOTE_DELAY", 43);
            store.set("PROP_DURATION", 43200);
        } else {
            EthTraderDAO parentDAO = EthTraderDAO(_parent);
            registry = Registry(address(parentDAO.registry));
            tokenFactory = MiniMeTokenFactory(address(parentDAO.tokenFactory));
            token = MiniMeToken(address(parentDAO.token));
            store = Store(address(parentDAO.store));
        }
    }

    function enactProp(uint _propIdx) public {
        Prop storage prop = props[_propIdx];

        if(!resolveProp(prop))
            return;

        if( prop.action == actions[1] ) {                                       // UPGRADE
            upgrade(address(extract20(prop.data)));
        } else if( prop.action == actions[2] ) {                                // ADD_ROOT
            roots.push(prop.data);
        } else if( prop.action ==  actions[3] ) {                               // TOGGLE_TRANSFERABLE
            token.enableTransfers(!token.transfersEnabled());
        } else if( prop.action ==  actions[4] ) {                               // TOGGLE_REG_ENDOW
            regEndow = !regEndow;
        } else if( prop.action == actions[5] ) {                                // SET_VALUE
            var (k, v) = split32_20_12(prop.data);
            votableValues[k] = uint(v);
        } else if( prop.action == actions[6] ) {                                // ENDOW
            var (r, a) = split32_20_12(prop.data);
            token.generateTokens(address(r), uint(a));
        }
    }

    function upgrade(address _newController) internal {
        registry.changeController(_newController);
        token.changeController(_newController);
        store.changeController(_newController);
    }

    function register(
        bytes20 _username,
        uint24 _endowment,
        uint32 _firstContent,
        bytes32[] _proof,
        uint16 _rootIndex
    ) public {
        require(
            registry.ownerToUsername(msg.sender) == 0 &&
            registry.usernameToUser(_username) == 0 &&
            validate(_username, _endowment, _firstContent, _proof, _rootIndex)
            );

        registry.add(_username, msg.sender);

        if(regEndow)
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
