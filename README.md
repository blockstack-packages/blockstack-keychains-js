# Elliptic Keychain

:tada:

A module for taking a bit of entropy and deriving an arbitrarily large number of child keys that are secretly linked until they're revealed and proven to be linked to the parent by the creator.

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
