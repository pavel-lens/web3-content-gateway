import { ethers } from 'ethers'
import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

const PAYABLE_ADDRESS = process.env.NEXT_PUBLIC_PAYABLE_ADDRESS

/* web3Modal configuration for enabling wallet access */
async function getWeb3Modal() {
  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: 'your-infura-id',
        },
      },
    },
  })
  return web3Modal
}

const Home: NextPage = () => {
  /* create local state to save account information after signin */
  const router = useRouter()
  const [account, setAccount] = useState('')
  const [userMessage, setUserMessage] = useState('')
  // const [provider, setProvider] =
  //   useState<ethers.providers.Web3Provider | null>(null)
  const { data: session, status } = useSession()

  if (status === 'authenticated' && session.isPremium === true) {
    router.push('/dashboard')
    return <></>
  }

  /* the connect function uses web3 modal to connect to the user's wallet */
  async function connect() {
    try {
      const web3Modal = await getWeb3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0])
      // setProvider(provider)

      console.log(`Web3: Account ${accounts[0]} connected.`)
      const signer = provider.getSigner(accounts[0])
      const messageToSign = `Sign in to app - timestamp ${+new Date()}`
      const signedMsg = await signer.signMessage(messageToSign)

      signIn('credentials', {
        account: accounts[0],
        message: messageToSign,
        signature: signedMsg,
      })
    } catch (err) {
      console.log('error:', err)
    }
  }

  async function sendPayment() {
    if (!session) {
      throw new Error(
        'You have to connect to wallet and sign in to your account first!'
      )
    }

    const tx = {
      to: PAYABLE_ADDRESS,
      value: ethers.utils.parseEther('0.01'), // 0.01 ETH
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner(session.address as string)
    const txObj = await signer.sendTransaction(tx)
    console.log({ txObj })

    const txReceipt = await provider.getTransactionReceipt(txObj.hash)
    console.log({ txReceipt })

    try {
      const response = await axios.post(
        `/api/payments/verify`,
        {
          txHash: txObj.hash,
        },
        {
          validateStatus: () => true,
        }
      )

      // Success! Redirect to use account (protected area)
      if (response.status === 200) {
        router.push('/dashboard')
        return
      } else {
        setUserMessage('There was a problem with your paymnet :-(')
      }
    } catch (err) {
      console.error(err)
    }

    // console.log(res)
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Sign in</h1>

        {status === 'unauthenticated' && (
          <div className="text--align-center">
            <div>Please, sign in with your wallet first.</div>
            <button onClick={connect}>Connect</button>
          </div>
        )}

        {status === 'authenticated' && (
          <div className="text--align-center">
            <div>
              You are signed-in, but you are not a premium user yet. Please pay
              0.01 ETH to become premium!
            </div>
            <button onClick={sendPayment}>Pay 0.01 ETH</button>
          </div>
        )}

        {status === 'authenticated' && (
          <div className="text--align-center">
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        )}

        <div className="mt-3">
          {status && (
            <div>
              <strong>Status</strong>
              <pre>{JSON.stringify({ status })}</pre>
            </div>
          )}

          {session && (
            <div>
              <strong>Sesion data</strong>
              <pre>{JSON.stringify(session, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
