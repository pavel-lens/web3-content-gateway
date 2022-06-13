import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ethers } from 'ethers'
import * as db from '../../../database'

type RequestPayload = {
  txHash: string
}

const PAYABLE_AMOUNT = '0.01' // 0.01  ETH
const PAYABLE_ADDRESS = process.env.OCTAV_PAYABLE_ADDRESS as string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(401).send('Forbidden')
  }

  try {
    const session = await getSession({ req })
    console.log(session)

    if (!session) {
      return res.status(401).send('Login with your wallet first')
    }

    const payload = req.body as RequestPayload

    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/'
    )

    /**
     * Wait till tx is mined. We wait for this in frontend, so this is a double-check.
     */
    const txReceipt = await provider.getTransactionReceipt(payload.txHash)
    // console.log(txReceipt)

    /**
     * Get transaction so that we can check amount and payable address
     */
    const tx = await provider.getTransaction(payload.txHash)
    console.log(tx)

    const ethAmount = ethers.utils.formatEther(tx.value)

    if (
      ethAmount === PAYABLE_AMOUNT &&
      tx.to?.toLocaleLowerCase() === PAYABLE_ADDRESS && // Verify recipient (Octav.fi payable account)
      tx.from.toLocaleLowerCase() === (session.address as string) // Verify sender
    ) {
      session.isPremium = true

      // Important to keep everything lowercase
      await db.addPremiumAccount(tx.from.toLocaleLowerCase())

      return res.status(200).send({
        status: 'Payment successful!',
        tx: tx,
      })
    } else {
      return res.status(402).send({
        status: 'Payment required',
        message: `Invalid payment amount: ${ethAmount} ETH. Must be ${PAYABLE_AMOUNT} ETH!`,
      })
    }
  } catch (err: any) {
    return res.status(500).send(err.message || err)
  }
}
