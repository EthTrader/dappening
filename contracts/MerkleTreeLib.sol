pragma solidity ^0.4.4;

library MerkleTreeLib {

    function checkProof(bytes32[] proof, bytes32 root, bytes32 h) constant returns (bool) {

        /*h = sha3(proof[0], h);*/

        /*return h > proof[0];*/

        /*h = proof[0];*/

        for (uint i = 0; i < proof.length; i++) {
            if (h < proof[i]) {
                h = sha3(h, proof[i]);
            } else {
                h = sha3(proof[i], h);
            }
        }

        return h == root;
    }

}
