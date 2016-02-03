# Elliptic Keychain

[![npm](https://img.shields.io/npm/l/elliptic-keychain.svg)](https://www.npmjs.com/package/elliptic-keychain)
[![npm](https://img.shields.io/npm/v/elliptic-keychain.svg)](https://www.npmjs.com/package/elliptic-keychain)
[![npm](https://img.shields.io/npm/dm/elliptic-keychain.svg)](https://www.npmjs.com/package/elliptic-keychain)
[![Slack](http://slack.blockstack.org/badge.svg)](http://slack.blockstack.org/)

A library for effective private and public keychain management.

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

### Installation

```
$ npm install elliptic-keychain
```

### Import your modules

#### ES6

```es6
import {
    PrivateKeychain, PublicKeychain, getChildKeypair, getEntropy
} from 'elliptic-keychain'
```

#### Javascript (ES5)

```js
var PrivateKeychain = require('elliptic-keychain').PrivateKeychain,
    PublicKeychain = require('elliptic-keychain').PublicKeychain,
    getEntropy = require('elliptic-keychain').getEntropy,
    getChildKeypair = require('elliptic-keychain').getChildKeypair
```

### Create a private keychain

```js
var privateKeychain = new PrivateKeychain()
```

### Create a public keychain

```js
var publicKeychain = privateKeychain.publicKeychain()
var publicKeychain2 = new PublicKeychain('023db6b4e3cb22097a9b6b9c82ff6becb8cb01561fd46c3484abf22ff4dc30ee58')
```

### Create a child by supplying entropy

```js
var entropy = getEntropy(32)
var privateChildKeychain = privateKeychain.child(entropy)
var publicChildKeychain = publicKeychain.child(entropy)
var publicChildKeychain2 = privateChildKeychain.publicKeychain()
```

Note that the independently derived public child keychains should be equal

```js
> console.log(publicChildKeychain.publicKey('hex') === publicChildKeychain2.publicKey('hex'))
true
```

### Create enumerated child keychains

```js
var firstPrivateChildKeychain = privateKeychain.privatelyEnumeratedChild(0)
var firstPublicChildKeychain = publicKeychain.publiclyEnumeratedChild(0)
```

Note that the privately-enumerated child should not correspond to the publicly-enumerated child

```js
> console.log(firstPrivateChildKeychain.publicKeychain().publicKey('hex') === firstPublicChildKeychain.publicKey('hex'))
false
```

### Create named child keychains

```js
var namedPrivateChildKeychain = privateKeychain.privatelyNamedChild('home-laptop-1')
var namedPublicChildKeychain = publicKeychain.publiclyNamedChild('home-laptop-1')
```

Note that the privately-named child should not correspond to the publicly-named child

```js
> console.log(namedPrivateChildKeychain.publicKeychain().publicKey('hex') === namedPublicChildKeychain.publicKey('hex'))
false
```
