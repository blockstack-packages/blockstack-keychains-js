'use strict'

module.exports = {
  getChildKeypair: require('./lib/derivation').default,
  getEntropy:      require('./lib/utils').default.getEntropy,
  PrivateKeychain: require('./lib/keychain').default.PrivateKeychain,
  PublicKeychain:  require('./lib/keychain').default.PublicKeychain,
  numberToEntropy: require('./lib/keychain').default.numberToEntropy
}
