pragma solidity ^0.4.15;

library MerkleTreeLib {

    function checkProof(bytes32[] proof, bytes32 root, bytes32 hash) constant returns (bool) {

        for (uint i = 0; i < proof.length; i++) {
            if (hash < proof[i]) {
                hash = sha3(hash, proof[i]);
            } else {
                hash = sha3(proof[i], hash);
            }
        }

        return hash == root;
    }

}
