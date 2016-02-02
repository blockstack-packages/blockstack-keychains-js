'use strict'

var test = require('tape'),
    lib = require('./index'),
    Keypair = lib.Keypair,
    getChildKeypair = lib.getChildKeypair,
    getEntropy = lib.getEntropy

test('deriveKeypair', function(t) {
    t.plan(5)

    var keypair = new Keypair.makeRandom({ rng: getEntropy })
    t.ok(keypair)
    var privateKeyWIF = keypair.toWIF()
    var publicKeyHex = keypair.getPublicKeyBuffer().toString('hex')
    console.log('Parent private key: ' + privateKeyWIF)
    console.log('Parent public key: ' + publicKeyHex)

    var childEntropy = getEntropy(32)
    t.ok(childEntropy)
    console.log('Child entropy: ' + childEntropy.toString('hex'))

    var childPrivateKeypair = getChildKeypair(keypair, childEntropy)
    var childPrivateKeyWIF = childPrivateKeypair.toWIF()
    var childPublicKeyHex = childPrivateKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPrivateKeypair)
    console.log('Child private key: ' + childPrivateKeyWIF)
    console.log('Child public key: ' + childPublicKeyHex)

    var childPublicKeypair = getChildKeypair(keypair, childEntropy)
    var childPublicKeyHex2 = childPublicKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPublicKeypair)
    console.log('Publicly-derived child public key: ' + childPublicKeyHex2)

    t.equal(childPublicKeyHex, childPublicKeyHex2)
})
