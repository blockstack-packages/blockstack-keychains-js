'use strict'

var test = require('tape'),
    lib = require('./index'),
    ECPair = require('bitcoinjs-lib').ECPair,
    getChildKeypair = lib.getChildKeypair,
    getEntropy = lib.getEntropy,
    PrivateKeychain = lib.PrivateKeychain,
    PublicKeychain = lib.PublicKeychain,
    numberToEntropy = lib.numberToEntropy

test('deriveKeypair', function(t) {
    t.plan(5)

    var keypair = new ECPair.makeRandom({ rng: getEntropy })
    t.ok(keypair, 'Keypair should have been created')
    var privateKeyWIF = keypair.toWIF()
    var publicKeyHex = keypair.getPublicKeyBuffer().toString('hex')
    //console.log('Parent private key: ' + privateKeyWIF)
    //console.log('Parent public key: ' + publicKeyHex)

    var childEntropy = getEntropy(32)
    t.ok(childEntropy, 'Entropy should have been generated')
    //console.log('Child entropy: ' + childEntropy.toString('hex'))

    var childPrivateKeypair = getChildKeypair(keypair, childEntropy)
    var childPrivateKeyWIF = childPrivateKeypair.toWIF()
    var childPublicKeyHex = childPrivateKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPrivateKeypair, 'Private keypair should have been created')
    //console.log('Child private key: ' + childPrivateKeyWIF)
    //console.log('Child public key: ' + childPublicKeyHex)

    var childPublicKeypair = getChildKeypair(keypair, childEntropy)
    var childPublicKeyHex2 = childPublicKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPublicKeypair, 'Public keypair should have been created')
    //console.log('Publicly-derived child public key: ' + childPublicKeyHex2)

    t.equal(childPublicKeyHex, childPublicKeyHex2)
})

test('PrivateKeychain', function(t) {
    t.plan(15)

    var privateKeychain = new PrivateKeychain()
    t.ok(privateKeychain instanceof PrivateKeychain, 'PrivateKeychain should have been created')

    var privateKeychain2 = new PrivateKeychain('5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr')
    t.ok(privateKeychain2, 'PrivateKeychain should have been created')

    var privateKeychain3 = new PrivateKeychain(new ECPair.fromWIF('5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr'))
    t.ok(privateKeychain3, 'PrivateKeychain should have been created')

    t.equal(privateKeychain2.privateKey('hex'), privateKeychain3.privateKey('hex'), 'Private keys should be equal')

    t.ok(privateKeychain.privateKey(), 'Private key should have been created')
    t.ok(privateKeychain.wif(), 'Private key WIF should have been created')
    
    var publicKeychain = privateKeychain.publicKeychain()
    t.ok(publicKeychain instanceof PublicKeychain, 'Public Keychain should have been created')

    var message = 'Hello, World!'
    var signature = privateKeychain.sign(message)
    t.ok(signature, 'Signature should have been created')

    var messageVerified = publicKeychain.verify(message, signature)
    t.ok(messageVerified, 'Message should have been verified')

    var entropy = getEntropy(32)
    var childPrivateKeychain = privateKeychain.child(entropy)
    t.ok(childPrivateKeychain, 'Private child should have been created')

    var childPublicKeychain = childPrivateKeychain.publicKeychain()
    t.ok(childPublicKeychain, 'Child public keychain should have been created from the child private keychain')
    var childPublicKeychain2 = publicKeychain.child(entropy)
    t.ok(childPublicKeychain2, 'Child public keychain should have been created from the parent public keychain')
    t.equal(childPublicKeychain.publicKey('hex'), childPublicKeychain2.publicKey('hex'), 'Child public keychains should be equal')

    var firstChildPrivateKeychain = privateKeychain.privatelyEnumeratedChild(0)
    t.ok(firstChildPrivateKeychain, 'Privately-enumerated child keychain should have been created')

    var namedChildPrivateKeychain = privateKeychain.privatelyNamedChild('home-laptop-1')
    t.ok(namedChildPrivateKeychain, 'Privately-named child keychain should have been created')
})

test('PublicKeychain', function(t) {
    t.plan(8)

    var publicKeychain = new PublicKeychain('023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58')
    t.ok(publicKeychain instanceof PublicKeychain, 'PublicKeychain should have been created')

    var publicKeychain2 = new PublicKeychain(new ECPair.fromPublicKeyBuffer(new Buffer('023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58', 'hex')))
    t.ok(publicKeychain2, 'PublicKeychain should have been created')

    t.equal(publicKeychain.publicKey('hex'), publicKeychain2.publicKey('hex'), 'Public keys should be equal')

    t.ok(publicKeychain.address(), 'Address should have been created')
    t.ok(publicKeychain.publicKey(), 'Public key should have been created')

    var entropy = getEntropy(32)
    var publicChild = publicKeychain.child(entropy)
    t.ok(publicChild, 'Public child keychain should have been created')

    var firstPublicChild = publicKeychain.publiclyEnumeratedChild(0)
    t.ok(firstPublicChild, 'Publicly-enumerated child keychain should have been created')

    var namedPublicChild = publicKeychain.publiclyNamedChild(0)
    t.ok(namedPublicChild, 'Publicly-named child keychain should have been created')
})
