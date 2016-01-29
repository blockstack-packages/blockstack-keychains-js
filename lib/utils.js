var crypto = require('crypto')

function getEntropy(numberOfBytes) {
  if (!numberOfBytes) numberOfBytes = 32
  return crypto.randomBytes(numberOfBytes)
}

module.exports = {
    getEntropy: getEntropy
}