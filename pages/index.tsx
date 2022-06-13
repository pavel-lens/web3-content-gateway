import { ethers } from 'ethers'
import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

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
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
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
        router.push('/protected')
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
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <div>{session && <div>{JSON.stringify(session)}</div>}</div>
        <div>{status && <div>{JSON.stringify({ status })}</div>}</div>
        {status === 'authenticated' && (
          <div>
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div>
            <button onClick={connect}>Connect</button>
          </div>
        )}

        {status === 'authenticated' && (
          <div>
            <button onClick={sendPayment}>Pay 0.01 ETH</button>
          </div>
        )}

        {userMessage && <div>{userMessage}</div>}

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <Link href="/protected" className={styles.card}>
            <div>
              <h2>Protected content &rarr;</h2>
              <p>Find in-depth information about Next.js features and API.</p>
            </div>
          </Link>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
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
