# Blockstack Keychains JS

[![CircleCI](https://img.shields.io/circleci/project/blockstack/blockstack-keychains-js/master.svg)](https://circleci.com/gh/blockstack/blockstack-keychains-js/tree/master)
[![npm](https://img.shields.io/npm/l/blockstack-keychains.svg)](https://www.npmjs.com/package/blockstack-keychains)
[![npm](https://img.shields.io/npm/v/blockstack-keychains.svg)](https://www.npmjs.com/package/blockstack-keychains)
[![npm](https://img.shields.io/npm/dm/blockstack-keychains.svg)](https://www.npmjs.com/package/blockstack-keychains)
[![Slack](http://chat.blockstack.org/badge.svg)](http://chat.blockstack.org/)

A library for effective private and public keychain management.

### Installation

```
$ npm install blockstack-keychains
```

### Importing

#### ES6

```es6
import { PrivateKeychain, PublicKeychain, getChildKeypair, getEntropy } from 'blockstack-keychains'
```

#### Javascript (ES5)

```es6
var blockstackKeychains = require('blockstack-keychains')
var PrivateKeychain = blockstackKeychains.PrivateKeychain,
    PublicKeychain = blockstackKeychains.PublicKeychain,
    getEntropy = blockstackKeychains.getEntropy,
    getChildKeypair = blockstackKeychains.getChildKeypair
```

### Overview

This library provides a powerful key derivation interface that is based on the creation of private and public keychains.

A private keychain contains a private key, and has a corresponding public keychain that can be derived from it.

Child keychains can be derived in 6 different ways:

1. use a private keychain and some supplied entropy to derive a private child keychain
1. use a private keychain and a key number to derive a private child keychain
1. use a private keychain and a label to derive a private child keychain
1. use a public keychain and some supplied entropy to derive a public child keychain
1. use a public keychain and a key number to derive a public child keychain
1. use a public keychain and a label to derive a public child keychain

Method 1 can be used to create private subaccounts, as long as the creator keeps a recording of the entropy used to derive each subaccount.

Method 2 can be used to enumerate private subaccounts, without the requirement of recording any information beyond the information stored in the master keychain (this is the equivalent of BIP32 hardened keys).

Method 3 can be used to create private subaccounts that can be accessed/re-derived by name.

Method 4 can be used to create children that are not known to be linked to the parent until the entropy for each key is revealed.

Method 5 can be used to enumerate a bunch of children and be certain that everyone with the same public keychain is enumerating the same keys without having to share additional information (this is the equivalent of BIP32 unhardened keys).

Method 6 can be used to create a bunch of children that can be accessed/re-derived by name.

### Private Keychains

```es6
let privateKeychain = new PrivateKeychain()
```

### Private Keys

```es6
let privateKey = privateKeychain.privateKey('hex')
```

### Public Keychains

```es6
let publicKeychain = privateKeychain.publicKeychain()
let publicKeyString = '023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58',
    publicKeychain2 = new PublicKeychain(publicKeyString)
```

### Public Keys

```es6
let publicKey = publicKeychain.publicKey('hex')
```

### Mnemonics

```es6
let mnemonic = privateKeychain.mnemonic()
console.log(mnemonic)
'aim elbow hungry involve ranch source car connect come wasp spread pet board welcome give garden virtual goose juice today over illness shove slam'
```

### Entropy-derived Child Keychains

```es6
let entropy = getEntropy(32)
let privateChildKeychain = privateKeychain.child(entropy)
let publicChildKeychain = publicKeychain.child(entropy)
let publicChildKeychain2 = privateChildKeychain.publicKeychain()
```

Note that the independently derived public child keychains should be equal:

```es6
let publicKey1 = publicChildKeychain.publicKey('hex')
let publicKey2 = publicChildKeychain2.publicKey('hex')
console.log(publicKey1 === publicKey2)
true
```

### Enumerated Child Keychains

```es6
let firstPrivateChildKeychain = privateKeychain.privatelyEnumeratedChild(0)
let firstPublicChildKeychain = publicKeychain.publiclyEnumeratedChild(0)
```

Note that the privately-enumerated child should not correspond to the publicly-enumerated child

```es6
let publicKey1 = firstPrivateChildKeychain.publicKeychain().publicKey('hex')
let publicKey2 = firstPublicChildKeychain.publicKey('hex')
console.log(publicKey1 === publicKey2)
false
```

### Named Child Keychains

```es6
let namedPrivateChildKeychain = privateKeychain.privatelyNamedChild('home-laptop-1')
let namedPublicChildKeychain = publicKeychain.publiclyNamedChild('home-laptop-1')
```

Note that the privately-named child should not correspond to the publicly-named child

```es6
let publicKey1 = namedPrivateChildKeychain.publicKeychain().publicKey('hex')
let publicKey2 = namedPublicChildKeychain.publicKey('hex')
console.log(publicKey1 === publicKey2)
false
```
