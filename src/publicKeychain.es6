import 'core-js/shim'
import { ECPair, message as messageSigner, crypto as hashing } from 'bitcoinjs-lib'
import { numberToEntropy } from './utils'
import { getChildKeypair } from './derivation'
import bip39 from 'bip39'

export class PublicKeychain {
  constructor(publicKey) {
    if (publicKey instanceof ECPair) {
      this.ecPair = publicKey
    } else if (publicKey instanceof Buffer) {
      this.ecPair = new ECPair.fromPublicKeyBuffer(publicKey)
    } else {
      const publicKeyBuffer = new Buffer(publicKey, 'hex')
      this.ecPair = new ECPair.fromPublicKeyBuffer(publicKeyBuffer)
    }
  }

  publicKey(format) {
    const publicKeyBuffer = this.ecPair.getPublicKeyBuffer()
    if (!format) {
      return publicKeyBuffer
    } else if (format === 'hex') {
      return publicKeyBuffer.toString('hex')
    } else {
      throw new Error('Format not supported')
    }
  }

  address() {
    return this.ecPair.getAddress()
  }

  verify(message, signature) {
    let signatureBuffer = signature
    if (!signature instanceof Buffer) {
      signatureBuffer = new Buffer(signature, 'hex')
    }
    return messageSigner.verify(this.address(), signature, message)
  }

  child(entropy) {
    if (!entropy instanceof Buffer) {
      throw new Error('Entropy must be a buffer')
    }
    const childKeypair = getChildKeypair(this.ecPair, entropy)
    return new PublicKeychain(childKeypair)
  }

  publiclyEnumeratedChild(index) {
    const entropy = numberToEntropy(this.publicKey(), index)
    return this.child(entropy)
  }

  publiclyNamedChild(name) {
    if (name.length === 0) {
      throw new Error('Name must be at least one character long')
    }
    const entropy = hashing.sha256(
      Buffer.concat([
        this.publicKey(),
        new Buffer(name)
      ])
    )
    return this.child(entropy)
  }
}
