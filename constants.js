const DAO_ACTIONS = {
  NONE: {
    label: "Poll",
    description: "A simple poll. To be submitted along with the id of an associated EthTrader post where discussion and options are described.",
    enum: 0
  },
  UPGRADE: {
    label: "Upgrade DAO contract",
    description: "Upgrades the DAO contract",
    enum: 1
  },
  ADD_ROOT: {
    label: "Add Merkle root",
    description: "Opens registration to a new batch of registrants.",
    enum: 2
  },
  TOGGLE_TRANSFERABLE: {
    label: "Toggle ETR transferable",
    description: "Toggles transferability of the ETR token.",
    enum: 3
  },
  TOGGLE_REG_ENDOW: {
    label: "Toggle endow upon registration",
    description: "Toggles ability to endow registrants with ETR when they register.",
    enum: 4
  },
  SET_VALUE: {
    label: "Set value",
    description: "Changes a DAO parameter value.",
    enum: 5
  },
  ENDOW: {
    label: "Endow",
    description: "Endows an address with some amount of newly minted ETR.",
    enum: 6
  },
  DEREG: {
    label: "Deregister",
    description: "Deregister a username.",
    enum: 7
  },
};

module.exports = {
  DAO_ACTIONS
}
