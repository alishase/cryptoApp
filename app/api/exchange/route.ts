import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fromCurrency, toCurrency, amount, rate } = await request.json();

    // Get user's source wallet
    const sourceWallet = await prisma.wallet.findFirst({
      where: { userId: session.user.id, currency: fromCurrency },
    });

    if (!sourceWallet || sourceWallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Get or create destination wallet
    let destinationWallet = await prisma.wallet.findFirst({
      where: { userId: session.user.id, currency: toCurrency },
    });

    if (!destinationWallet) {
      destinationWallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          currency: toCurrency,
          balance: 0,
          address: `${toCurrency.toLowerCase()}-${Math.random()
            .toString(36)
            .substring(2, 15)}`,
        },
      });
    }

    const convertedAmount = amount * rate;

    // Perform the exchange
    await prisma.$transaction([
      // Deduct from source wallet
      prisma.wallet.update({
        where: { id: sourceWallet.id },
        data: { balance: { decrement: amount + amount * 0.005 } },
      }),
      // Add to destination wallet
      prisma.wallet.update({
        where: { id: destinationWallet.id },
        data: { balance: { increment: convertedAmount } },
      }),
      // Record the transaction
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "TRADE",
          amount,
          currency: fromCurrency,
          status: "COMPLETED",
          walletId: sourceWallet.id,
          fromAddress: sourceWallet.address,
          toAddress: destinationWallet.address,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exchange failed:", error);
    return NextResponse.json({ error: "Exchange failed" }, { status: 500 });
  }
}
