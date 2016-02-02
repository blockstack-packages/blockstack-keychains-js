'use strict'

var lib = require('./lib/main').default

module.exports = {
  Keypair:         lib.Keypair,
  getChildKeypair: lib.getChildKeypair,
  getEntropy:      lib.getEntropy
}
