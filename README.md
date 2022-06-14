This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Web3 content gateway

This is a simple project built with [Next.js](https://nextjs.org/) to showcase how to protect a premium content behind 2 steps in Web3

1. Sign in a message with your wallet - verify signature on server-sider
2. Pay 0.01 ETH to predefined address to become a "premium user" to be able to access premium content

## How to run

### Installation

First, run the development server:

```bash
npm ci
```

### Configuration

Terminal 1: Copy sample env file and run Hardhat (local Ethereum network)

```bash
cp env.local.example .env.local
npx hardhat node
```

Set `NEXT_PUBLIC_PAYABLE_ADDRESS` in `.env.local` file to Account #0 from `npx hardhat node` command output.

Important: Verify that your Hardhat RPC address corresponds to the `NETWORK_RPC` variable in `.env.local`

Optional: Change values `NEXTAUTH_URL` and/or `NEXTAUTH_SECRET` according to your local setup.

Terminal 2: Run the app in dev mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Add Account #1 from `npx hardhat node` command output to your Web3 wallet.

Optional: Add Account #0 from `npx hardhat node` command output to verify receival of the payment in your Web3 wallet.

Choose "Account #1" in your Web3 wallet (the customer) and follow the sign in workflow.

Optional: After signing in and paying, you can verify in "Account #0" if ETH was received.

## NextJS: Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
