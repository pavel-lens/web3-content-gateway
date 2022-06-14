import { withAuth } from 'next-auth/middleware'

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      console.log(`pages/dashboard: ${JSON.stringify(token)}`)
      return token?.isPremium === true
    },
  },
})
