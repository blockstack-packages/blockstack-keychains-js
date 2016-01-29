# ECDSA Keychain

A module for taking a bit of entropy and deriving an arbitrarily large number of child keys that are secretly linked until they're revealed and proven to be linked to the parent by the creator.

### Installation

```
$ npm install ecdsa-keychain
```

### Import your modules

```js
var ecdsaKeychain = require('ecdsa-keychain')
    derivePrivateKeypair = ecdsaKeychain.derivePrivateKeypair,
    derivePublicKeypair = ecdsaKeychain.derivePublicKeypair,
    getEntropy = ecdsaKeychain.getEntropy
```

### Create a parent keypair

```js
var keypair = new Keypair.makeRandom({ rng: getEntropy }),
    privateKeyWIF = keypair.toWIF(),
    publicKeyHex = keypair.getPublicKeyBuffer().toString('hex')
```

### Derive a child private keypair

```js
var childEntropy = getEntropy(32),
    childPrivateKeypair = derivePrivateKeypair(keypair, childEntropy),
    childPrivateKeyWIF = childPrivateKeypair.toWIF(),
    childPublicKeyHex = childPrivateKeypair.getPublicKeyBuffer().toString('hex')
```

### Create a child public keypair

```js
var childPublicKeypair = derivePublicKeypair(keypair, childEntropy),
    childPublicKeyHex2 = childPublicKeypair.getPublicKeyBuffer().toString('hex')
```

### Compare the derived public keys

```js
> console.log(childPublicKeyHex, childPublicKeyHex2)
true
```

:tada:
