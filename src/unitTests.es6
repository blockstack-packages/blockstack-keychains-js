'use strict'

import test from 'tape'
import { ECPair } from 'bitcoinjs-lib'
import bip39 from 'bip39'
import {
    getChildKeypair, getEntropy, numberToEntropy,
    PrivateKeychain, PublicKeychain
} from './index'

test('deriveKeypair', function(t) {
    t.plan(5)

    let keypair = new ECPair.makeRandom({ rng: getEntropy })
    t.ok(keypair, 'Keypair should have been created')
    let privateKeyWIF = keypair.toWIF()
    let publicKeyHex = keypair.getPublicKeyBuffer().toString('hex')
    //console.log('Parent private key: ' + privateKeyWIF)
    //console.log('Parent public key: ' + publicKeyHex)

    let childEntropy = getEntropy(32)
    t.ok(childEntropy, 'Entropy should have been generated')
    //console.log('Child entropy: ' + childEntropy.toString('hex'))

    let childPrivateKeypair = getChildKeypair(keypair, childEntropy)
    let childPrivateKeyWIF = childPrivateKeypair.toWIF()
    let childPublicKeyHex = childPrivateKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPrivateKeypair, 'Private keypair should have been created')
    //console.log('Child private key: ' + childPrivateKeyWIF)
    //console.log('Child public key: ' + childPublicKeyHex)

    let childPublicKeypair = getChildKeypair(keypair, childEntropy)
    let childPublicKeyHex2 = childPublicKeypair.getPublicKeyBuffer().toString('hex')
    t.ok(childPublicKeypair, 'Public keypair should have been created')
    //console.log('Publicly-derived child public key: ' + childPublicKeyHex2)

    t.equal(childPublicKeyHex, childPublicKeyHex2)
})

test('PrivateKeychain', function(t) {
    t.plan(20)

    let privateKeychain = new PrivateKeychain()
    t.ok(privateKeychain instanceof PrivateKeychain, 'PrivateKeychain should have been created')

    let privateKeychain2 = new PrivateKeychain('5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr')
    t.ok(privateKeychain2, 'PrivateKeychain should have been created')

    let privateKeychain3 = new PrivateKeychain(new ECPair.fromWIF('5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr'))
    t.ok(privateKeychain3, 'PrivateKeychain should have been created')

    t.equal(privateKeychain2.privateKey('hex'), privateKeychain3.privateKey('hex'), 'Private keys should be equal')

    t.ok(privateKeychain.privateKey(), 'Private key should have been created')
    t.ok(privateKeychain.wif(), 'Private key WIF should have been created')
    
    let publicKeychain = privateKeychain.publicKeychain()
    t.ok(publicKeychain instanceof PublicKeychain, 'Public Keychain should have been created')

    let message = 'Hello, World!'
    let signature = privateKeychain.sign(message)
    t.ok(signature, 'Signature should have been created')

    let messageVerified = publicKeychain.verify(message, signature)
    t.ok(messageVerified, 'Message should have been verified')

    let entropy = getEntropy(32)
    let childPrivateKeychain = privateKeychain.child(entropy)
    t.ok(childPrivateKeychain, 'Private child should have been created')

    let childPublicKeychain = childPrivateKeychain.publicKeychain()
    t.ok(childPublicKeychain, 'Child public keychain should have been created from the child private keychain')
    let childPublicKeychain2 = publicKeychain.child(entropy)
    t.ok(childPublicKeychain2, 'Child public keychain should have been created from the parent public keychain')
    t.equal(childPublicKeychain.publicKey('hex'), childPublicKeychain2.publicKey('hex'), 'Child public keychains should be equal')

    let firstChildPrivateKeychain = privateKeychain.privatelyEnumeratedChild(0)
    t.ok(firstChildPrivateKeychain, 'Privately-enumerated child keychain should have been created')

    let namedChildPrivateKeychain = privateKeychain.privatelyNamedChild('home-laptop-1')
    t.ok(namedChildPrivateKeychain, 'Privately-named child keychain should have been created')

    let mnemonic = privateKeychain.mnemonic()
    t.ok(mnemonic, 'Mnemonic should have been created')

    let recoveredPrivateKey = bip39.mnemonicToEntropy(mnemonic)
    t.ok(recoveredPrivateKey, 'Private key should have been recovered from mnemonic')
    t.equal(privateKeychain.privateKey('hex'), recoveredPrivateKey, 'Private key recovered from mnemonic should match the original')

    let privateKeychainFromMnemonic = PrivateKeychain.fromMnemonic(mnemonic)
    t.ok(privateKeychainFromMnemonic, 'Private keychain should have been created from mnemonic')
    t.equal(privateKeychainFromMnemonic.privateKey('hex'), privateKeychain.privateKey('hex'), 'Recovered private keychain should equal original')
})

test('PublicKeychain', function(t) {
    t.plan(8)

    let publicKeychain = new PublicKeychain('023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58')
    t.ok(publicKeychain instanceof PublicKeychain, 'PublicKeychain should have been created')

    let publicKeychain2 = new PublicKeychain(new ECPair.fromPublicKeyBuffer(new Buffer('023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58', 'hex')))
    t.ok(publicKeychain2, 'PublicKeychain should have been created')

    t.equal(publicKeychain.publicKey('hex'), publicKeychain2.publicKey('hex'), 'Public keys should be equal')

    t.ok(publicKeychain.address(), 'Address should have been created')
    t.ok(publicKeychain.publicKey(), 'Public key should have been created')

    let entropy = getEntropy(32)
    let publicChild = publicKeychain.child(entropy)
    t.ok(publicChild, 'Public child keychain should have been created')

    let firstPublicChild = publicKeychain.publiclyEnumeratedChild(0)
    t.ok(firstPublicChild, 'Publicly-enumerated child keychain should have been created')

    let namedPublicChild = publicKeychain.publiclyNamedChild(0)
    t.ok(namedPublicChild, 'Publicly-named child keychain should have been created')
})
