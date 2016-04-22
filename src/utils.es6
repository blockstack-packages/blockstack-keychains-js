import 'core-js/shim'
import { randomBytes } from 'crypto'

export function getEntropy(numberOfBytes) {
  if (!numberOfBytes) {
    numberOfBytes = 32
  }
  return randomBytes(numberOfBytes)
}