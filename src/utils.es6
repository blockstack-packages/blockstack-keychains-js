import 'core-js/shim'
import { randomBytes } from 'crypto'
import bs58check from 'bs58check'
import { crypto as hashing } from 'bitcoinjs-lib'

export function getEntropy(numberOfBytes) {
  if (!numberOfBytes) {
    numberOfBytes = 32
  }
  return randomBytes(numberOfBytes)
}

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
