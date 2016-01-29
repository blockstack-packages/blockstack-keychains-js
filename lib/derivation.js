var createHmac = require('create-hmac'),
    BigInteger = require('bigi'),
    ECPair = require('bitcoinjs-lib').ECPair,
    ecurve = require('ecurve'),
    secp256k1 = ecurve.getCurveByName('secp256k1')

function getChildScalar(parentKeypair, entropyBuffer) {
  var parentPublicKeyBuffer = parentKeypair.getPublicKeyBuffer(),
      childScalar = BigInteger.fromBuffer(
        createHmac('sha256',
          Buffer.concat([parentPublicKeyBuffer, entropyBuffer])
        ).digest()
      )

  if (childScalar.compareTo(secp256k1.n) >= 0) {
    throw new TypeError('Entropy is resulting in an invalid child scalar')
  }

  return childScalar
}

function derivePrivateKeypair(parentKeypair, entropyBuffer) {
  if (!parentKeypair.d) {
    throw new TypeError('Parent keypair must have a private key')
  }

  var childScalar = getChildScalar(parentKeypair, entropyBuffer),
      parentSecretExponent = parentKeypair.d,
      childSecretExponent = childScalar.add(parentSecretExponent).mod(secp256k1.n)

  if (childSecretExponent.signum() === 0) {
    throw new TypeError('Entropy is resulting in an invalid child private key')
  }

  return new ECPair(childSecretExponent, null, {})
}

function derivePublicKeypair(parentKeypair, entropyBuffer) {
  if (!parentKeypair.Q) {
    throw new TypeError('Parent keypair must have a public key')
  }

  var childScalar = getChildScalar(parentKeypair, entropyBuffer),
      parentPoint = parentKeypair.Q,
      childPoint = secp256k1.G.multiply(childScalar).add(parentPoint)

  if (secp256k1.isInfinity(childPoint)) {
    throw new TypeError('Entropy is resulting in an invalid child public key')
  }

  return new ECPair(null, childPoint, {})
}

module.exports = {
  Keypair: ECPair,
  getChildScalar: getChildScalar,
  derivePrivateKeypair: derivePrivateKeypair,
  derivePublicKeypair: derivePublicKeypair
}
