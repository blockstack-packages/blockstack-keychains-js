# Elliptic Keychain

A module for taking a bit of entropy and deriving an arbitrarily large number of child keys that are secretly linked until they're revealed and proven to be linked to the parent by the creator.

### Installation

```
$ npm install elliptic-keychain
```

### Import your modules

#### ES6

```es6
import { getChildKeypair, getEntropy } from 'elliptic-keychain'
```

#### Javascript

```js
var getChildKeypair = require('elliptic-keychain').getChildKeypair,
    getEntropy = require('elliptic-keychain').getEntropy
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
    childPrivateKeypair = getChildKeypair(keypair, childEntropy),
    childPrivateKeyWIF = childPrivateKeypair.toWIF(),
    childPublicKeyHex = childPrivateKeypair.getPublicKeyBuffer().toString('hex')
```

### Create a child public keypair

```js
var childPublicKeypair = getChildKeypair(keypair, childEntropy),
    childPublicKeyHex2 = childPublicKeypair.getPublicKeyBuffer().toString('hex')
```

### Compare the derived public keys

```js
> console.log(childPublicKeyHex)
027134e91d942ab2711783be21a104b0ca3ecc5bd4bba7919fb4f67d9f3a17125a
> console.log(childPublicKeyHex2)
027134e91d942ab2711783be21a104b0ca3ecc5bd4bba7919fb4f67d9f3a17125a
```

:tada:
