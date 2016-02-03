import 'core-js/shim'
import { randomBytes } from 'crypto'

function getEntropy(numberOfBytes) {
  if (!numberOfBytes) numberOfBytes = 32
  return randomBytes(numberOfBytes)
}

export default {
  getEntropy: getEntropy
}