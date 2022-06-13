import { promises as fs } from 'fs'

const DB_PATH = './db.json'

export async function getPremiumAccounts() {
  const content = await fs.readFile(DB_PATH)
  return JSON.parse(content.toString())
}

export async function addPremiumAccount(account: string) {
  const currentAccounts = await getPremiumAccounts()

  const updatedAccounts = [...currentAccounts, account]
  await fs.writeFile(DB_PATH, JSON.stringify(updatedAccounts, null, 2))
}

export async function isPremiumAccount(account: string) {
  const premiumAccounts = await getPremiumAccounts()

  return premiumAccounts.includes(account)
}
