'use strict'

module.exports = {
    Keypair: require('./lib/derivation').Keypair,
    derivePrivateKeypair: require('./lib/derivation').derivePrivateKeypair,
    derivePublicKeypair: require('./lib/derivation').derivePublicKeypair,
    getEntropy: require('./lib/utils').getEntropy
}
