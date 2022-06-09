import { ethers } from 'ethers'

export type Account = string

export function verifyMessageSignature(
  account: Account,
  message: string,
  signature: string
) {
  // Account derived from signature and original message
  const derivedAccount = ethers.utils.verifyMessage(message, signature)

  return account === derivedAccount
}
