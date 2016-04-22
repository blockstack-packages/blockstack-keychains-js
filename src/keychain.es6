import 'core-js/shim'
import { ECPair, message as messageSigner, crypto as hashing } from 'bitcoinjs-lib'
import bs58check from 'bs58check'
import { getEntropy } from './utils'
import { getChildKeypair } from './derivation'
import bip39 from 'bip39'

export function isWIF(privateKeyString) {
  let isValid = true
  try {
    bs58check.decode(privateKeyString)
  } catch(e) {
    isValid = false
  }
  return isValid
}

export function numberToEntropy(baseBuffer, index) {
  if (!typeof index === 'number') {
    throw new Error('Index must be a number')
  }
  let indexHexString = index.toString(16)
  if (indexHexString.length % 2 === 1) {
    indexHexString = '0' + indexHexString
  }
  const entropy = hashing.sha256(
    Buffer.concat([
      baseBuffer,
      new Buffer(indexHexString, 'hex')
    ])
  )
  return entropy
}

export class PrivateKeychain {
  constructor(privateKey) {
    if (!privateKey) {
      this.ecPair = new ECPair.makeRandom({ rng: getEntropy })
    } else {
      if (privateKey instanceof ECPair) {
        this.ecPair = privateKey
      } else if (isWIF(privateKey)) {
        this.ecPair = new ECPair.fromWIF(privateKey)
      } else {
        this.ecPair = new ECPair(privateKey, null, {})
      }
    }
  }

  publicKeychain() {
    return new PublicKeychain(this.ecPair.getPublicKeyBuffer())
  }

  privateKey(format) {
    const privateKeyBuffer = this.ecPair.d.toBuffer(32)
    if (!format) {
      return privateKeyBuffer
    } else if (format === 'hex') {
      return privateKeyBuffer.toString('hex')
    } else {
      throw new Error('Format not supported')
    }
  }

  mnemonic() {
    return bip39.entropyToMnemonic(this.privateKey('hex'))
  }

  wif() {
    return this.ecPair.toWIF()
  }

  sign(message) {
    return messageSigner.sign(this.ecPair, message)
  }

  child(entropy) {
    if (!entropy instanceof Buffer) {
      throw new Error('Entropy must be a buffer')
    }
    const childKeypair = getChildKeypair(this.ecPair, entropy)
    return new PrivateKeychain(childKeypair)
  }

  privatelyEnumeratedChild(index) {
    const entropy = numberToEntropy(this.privateKey(), index)
    return this.child(entropy)
  }

  privatelyNamedChild(name) {
    if (name.length === 0) {
      throw new Error('Name must be at least one character long')
    }
    const entropy = hashing.sha256(
      Buffer.concat([
        this.privateKey(),
        new Buffer(name)
      ])
    )
    return this.child(entropy)
  }
}

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
