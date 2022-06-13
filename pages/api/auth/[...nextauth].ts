import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyMessageSignature } from '../../../utils'
import * as db from '../../../database'

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      const userAccount = (token.sub as string).toLocaleLowerCase()
      const isPremiumAccount = await db.isPremiumAccount(userAccount)

      // console.log(`session(): user = ${JSON.stringify(session.user)}`)
      session.address = userAccount
      session.isPremium = isPremiumAccount
      // session.user = session.user || {}
      // session.user.name = token.sub
      // session.user.image = ''
      // console.log({ session })
      token.isPremium = isPremiumAccount
      return session
    },
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        account: { label: 'Account', type: 'text', placeholder: '' },
        message: { label: 'Message', type: 'text', placeholder: '' },
        signature: { label: 'Signature', type: 'text', placeholder: '' },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        console.log({ credentials })
        // const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com' }

        if (!credentials) {
          return null
        }

        const isSignatureValid = verifyMessageSignature(
          credentials.account || '',
          credentials.message || '',
          credentials.signature || ''
        )

        console.log({ isSignatureValid })

        if (!isSignatureValid) {
          return null
        }

        return {
          id: credentials.account,
          account: credentials.account,
        }
      },
    }),
  ],
})
