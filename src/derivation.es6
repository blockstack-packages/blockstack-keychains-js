import 'core-js/shim'
import createHmac from 'create-hmac'
import BigInteger from 'bigi'
import { ECPair } from 'bitcoinjs-lib'
import ecurve from 'ecurve'

const secp256k1 = ecurve.getCurveByName('secp256k1')

function getChildKeyMultiplier(parentKeypair, entropyBuffer) {
  const parentPublicKeyBuffer = parentKeypair.getPublicKeyBuffer()
  const childKeyMultiplier = BigInteger.fromBuffer(
    createHmac('sha256',
      Buffer.concat([parentPublicKeyBuffer, entropyBuffer])
    ).digest()
  )

  if (childKeyMultiplier.compareTo(secp256k1.n) >= 0) {
    throw new TypeError('Entropy is resulting in an invalid child scalar')
  }

  return childKeyMultiplier
}

function getChildPrivateKeypair(parentKeypair, entropyBuffer) {
  if (!parentKeypair.d) {
    throw new TypeError('Parent keypair must have a private key')
  }

  const childKeyMultiplier = getChildKeyMultiplier(parentKeypair, entropyBuffer),
        parentSecretExponent = parentKeypair.d,
        childSecretExponent = childKeyMultiplier.add(parentSecretExponent).mod(secp256k1.n)

  if (childSecretExponent.signum() === 0) {
    throw new TypeError('Entropy is resulting in an invalid child private key')
  }

  return new ECPair(childSecretExponent, null, {})
}

function getChildPublicKeypair(parentKeypair, entropyBuffer) {
  if (!parentKeypair.Q) {
    throw new TypeError('Parent keypair must have a public key')
  }

  const childKeyMultiplier = getChildKeyMultiplier(parentKeypair, entropyBuffer),
        parentPoint = parentKeypair.Q,
        childPoint = secp256k1.G.multiply(childKeyMultiplier).add(parentPoint)

  if (secp256k1.isInfinity(childPoint)) {
    throw new TypeError('Entropy is resulting in an invalid child public key')
  }

  return new ECPair(null, childPoint, {})
}

export function getChildKeypair(parentKeypair, entropyBuffer) {
  if (parentKeypair.d) {
    // parent keypair has both a private key and a public key
    return getChildPrivateKeypair(parentKeypair, entropyBuffer)
  } else {
    // parent keypair only has a public key in it
    return getChildPublicKeypair(parentKeypair, entropyBuffer)
  }
}