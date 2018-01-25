pragma solidity ^0.4.17;

import "./Token.sol";
import "./Interfaces.sol";
import "./UtilityLib.sol";

contract TokenDAO {

    enum Actions                  { UPGRADE, ADD_ROOT }

    struct Prop {
        Actions                     action;
        bytes32                     data;
        uint                        startedAt;
        uint                        lastSigVoteAt;
        bool                        passed;
        mapping(uint => uint)       results;
        mapping(address => bool)    voted;
    }

    IRegistry                       public registry;
    IToken                          public token;
    Prop[]                          public props;
    bytes32[]                       public roots;

    uint                            constant PROP_STAKE = 1000;
    uint                            constant SIG_VOTE = 200;
    uint                            constant SIG_VOTE_DELAY = 43;
    uint                            constant PROP_DURATION = 12343; //43200;

    event Proposed(bytes20 username, uint propIdx);
    event Voted(bytes20 username, uint propIdx, uint prefIdx);
    event Resolved(uint propIdx, bool result);

    function TokenDAO(bool _isDev, address _parent, address _token, address _registry, bytes32 _root){
      if(_isDev) {
          SIG_VOTE_DELAY = 0;
          PROP_DURATION = 2;
      }
      if(_parent == 0){
          roots.push(_root);
          token = IToken(_token);
          registry = IRegistry(_registry);
      } else {
          TokenDAO parentDAO = TokenDAO(_parent);
          token = IToken(address(parentDAO.token));
          registry = IRegistry(address(parentDAO.registry));
      }
    }

    function upgrade(address _newController) internal {
        registry.changeController(_newController);
        token.changeController(_newController);
    }

    function register(
        bytes20 _username,
        uint96 _endowment,
        uint32 _firstContent,
        bytes32[] _proof,
        uint16 _rootIndex
    ) public {
        require(
            registry.ownerToUsername(msg.sender) == 0 &&
            registry.getOwner(_username) == 0 &&
            validate(_username, _endowment, _firstContent, _proof, _rootIndex)
            );

        registry.add(_username, msg.sender, _firstContent);

        if(regEndow)
            token.generateTokens(msg.sender, _endowment);
    }

    function validate(
        bytes20 _username,
        uint96 _endowment,
        uint32 _firstContent,
        bytes32[] _proof,
        uint16 _rootIndex
    ) public view returns (bool) {
        bytes32 hash = keccak256(msg.sender, _username, _endowment, _firstContent);
        return UtilityLib.checkProof(_proof, roots[_rootIndex], hash);
    }

    function addProp(Actions _action, bytes32 _data) public {
        bytes20 username = registry.ownerToUsername(msg.sender);
        require( username != 0 );                                               // only registered users can propose

        Prop memory prop;

        require( 
            token.transferFrom(msg.sender, 1, PROP_STAKE * 10**token.decimals)
            );

        prop.action = _action;
        prop.data = _data;
        prop.startedAt = block.number;
        prop.author = username;

        Proposed(bytes20 username, props.push(prop)-1);
    }

    function enact(uint _propIdx) public {
        Prop storage prop = props[_propIdx];

        require(
            prop.passed == false &&
            block.number >= prop.lastSigVoteAt + SIG_VOTE_DELAY &&
            block.number >= prop.startedAt + PROP_DURATION &&
            prop.results[1]/2 > prop.results[0] &&                              // 2/3 majority to pass
            token.transferFrom(                                                 // return staked tokens
                1,
                registry.getOwner(prop.author),
                PROP_STAKE * 10**token.decimals
                )
            );

        prop.passed = true;


        if( prop.action == Actions.UPGRADE ) {
            upgrade(address(UtilityLib.extract20(prop.data)));
        } else if( prop.action == Actions.ADD_ROOT ) {
            roots.push(prop.data);
        }
    }

    function getResult(uint _propIdx, uint _prefIdx) public view returns (uint) {
        Prop storage prop = props[_propIdx];
        return prop.results[_prefIdx];
    }

    function getVoted(uint _propIdx) public view returns (bool) {
        Prop storage prop = props[_propIdx];
        return prop.voted[msg.sender];
    }

    function isVotable(Prop _prop) returns (bool) {
        return block.number < prop.startedAt + PROP_DURATION ||
            block.number < prop.lastSigVoteAt + SIG_VOTE_DELAY;
    }

    function getVoteWeight(address _voter, uint _blockNumber) public view returns (uint) {
        // some penalty if > X tokens moved within some recent time frame?
        // penalty if tokens moved in (could be buying influence) but then could be abused to limit someones influence
        // penalty if tokens moved out ? is that worth it?
        return token.balanceOfAt(_voter, _blockNumber);
    }

    function getNumProps() public view returns (uint) {
        return props.length;
    }

    /* function getProps() public view returns (Prop[]) { */
    function getProps() public view returns (Actions[], bytes32[], uint[], uint[], bool[], bool[]) {
        Actions[] memory actions = new Actions[](props.length);
        bytes32[] memory data = new bytes32[](props.length);
        uint[]    memory starts = new uint[](props.length);
        uint[]    memory lasts = new uint[](props.length);
        bool[]    memory passed = new bool[](props.length);
        bool[]    memory voted = new bool[](props.length);

        for (uint i = 0; i < props.length; i++) {
            Prop storage prop = props[i];
            actions[i] = prop.action;
            data[i] = prop.data;
            starts[i] = prop.startedAt;
            lasts[i] = prop.lastSigVoteAt;
            passed[i] = prop.passed;
            voted[i] = prop.voted[msg.sender];
        }

        return (actions, data, starts, lasts, passed, voted);
    }

    function vote(uint _propIdx, uint _prefIdx) public {
        bytes20 username = registry.ownerToUsername(msg.sender);
        require( username != 0 );

        Prop storage prop = props[_propIdx];

        require(prop.voted[msg.sender] == false);                               // didn't already vote
        require(                                                                // prop still active
            block.number < prop.startedAt + PROP_DURATION ||
            block.number < prop.lastSigVoteAt + SIG_VOTE_DELAY
            );

        uint voteWeight = token.balances(msg.sender)[0].value;                  // starting balance
        if(voteWeight >= SIG_VOTE * 10**token.decimals)
            prop.lastSigVoteAt = block.number;
        prop.results[_prefIdx] += voteWeight;
        prop.voted[msg.sender] = true;
        Voted(username, _propIdx, _prefIdx);
    }
}
