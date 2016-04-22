import 'core-js/shim'
import { ECPair, message as messageSigner, crypto as hashing } from 'bitcoinjs-lib'
import BigInteger from 'bigi'
import bip39 from 'bip39'
import { getEntropy, isWIF, numberToEntropy } from './utils'
import { getChildKeypair } from './derivation'
import { PublicKeychain } from './publicKeychain'

export class PrivateKeychain {
  constructor(privateKey) {
    if (!privateKey) {
      this.ecPair = new ECPair.makeRandom({ rng: getEntropy })
    } else {
      if (privateKey instanceof ECPair) {
        this.ecPair = privateKey
      } else if (privateKey instanceof Buffer) {
        const privateKeyBigInteger = BigInteger.fromBuffer(privateKey)
        this.ecPair = new ECPair(privateKeyBigInteger, null, {})
      } else if (isWIF(privateKey)) {
        this.ecPair = new ECPair.fromWIF(privateKey)
      } else if (typeof privateKey === 'string') {
        const privateKeyBuffer = new Buffer(privateKey, 'hex'),
              privateKeyBigInteger = BigInteger.fromBuffer(privateKeyBuffer)
        this.ecPair = new ECPair(privateKeyBigInteger, null, {})
      } else {
        throw new Error('Invalid private key format')
      }
    }
  }

  static fromMnemonic(mnemonic) {
    const privateKey = bip39.mnemonicToEntropy(mnemonic)
    return new PrivateKeychain(privateKey)
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