import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { getExchangeRate } from "../../../../lib/binance"; // Adjust the import path as needed

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
    });

    // Calculate total balance by converting each currency to USD
    let totalBalance = 0;
    const walletsWithUSD = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const usdRate = await getExchangeRate(wallet.currency, "USD");
          const usdValue = wallet.balance * usdRate;
          totalBalance += usdValue;

          return {
            currency: wallet.currency,
            balance: wallet.balance,
            usdValue: usdValue,
            usdRate: usdRate,
          };
        } catch (error) {
          console.error(
            `Failed to get exchange rate for ${wallet.currency}:`,
            error
          );
          // Return wallet without USD conversion if rate fetch fails
          return {
            currency: wallet.currency,
            balance: wallet.balance,
            usdValue: null,
            error: "Failed to fetch exchange rate",
          };
        }
      })
    );

    return NextResponse.json({
      totalBalance,
      wallets: walletsWithUSD,
    });
  } catch (error) {
    console.error("Failed to calculate total balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
