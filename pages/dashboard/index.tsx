import type { NextPage } from 'next'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

import styles from '../../styles/Home.module.css'

const Page: NextPage = () => {
  const { data: session, status } = useSession()

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <Link href="/">DeFi PnL</Link> Dashboard
        </h1>
        <p className={styles.description}>
          This page is only available to paying customers. Congrats 🎉
        </p>
        <div>
          {session && (
            <div>
              <strong>Sesion data</strong>
              <pre>{JSON.stringify(session, null, 2)}</pre>
            </div>
          )}
        </div>
        {status === 'authenticated' && (
          <div>
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Page
