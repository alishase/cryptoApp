import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createWallet(userId: string, currency: string) {
  return prisma.wallet.create({
    data: {
      userId: userId,
      currency: currency,
      balance: 0,
      address: `${currency.toLowerCase()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`,
    },
  });
}

export async function getOrCreateWallet(userId: string, currency: string) {
  let wallet = await prisma.wallet.findFirst({
    where: { userId, currency },
  });

  if (!wallet) {
    wallet = await createWallet(userId, currency);
  }

  return wallet;
}

export async function updateWalletBalance(walletId: string, amount: number) {
  return prisma.wallet.update({
    where: { id: walletId },
    data: { balance: { increment: amount } },
  });
}
