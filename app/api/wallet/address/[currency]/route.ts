import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { getOrCreateDepositAddress } from "../../../../../lib/services/deposit.service";

// Define supported deposit cryptocurrencies
const DEPOSIT_CRYPTOCURRENCIES = {
  BTC: "bitcoin",
  USDT: "tether",
  TON: "ton",
  ETH: "ethereum",
  SOL: "solana",
};

export async function GET(
  request: Request,
  { params }: { params: { currency: string } }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Normalize and validate currency
    const currency = params.currency.toUpperCase();
    if (!Object.keys(DEPOSIT_CRYPTOCURRENCIES).includes(currency)) {
      return NextResponse.json(
        { error: "Unsupported cryptocurrency for deposit" },
        { status: 400 }
      );
    }

    // Get or create deposit address
    const depositAddress = await getOrCreateDepositAddress(
      session.user.id,
      currency
    );

    return NextResponse.json({
      currency,
      address: depositAddress,
      network:
        DEPOSIT_CRYPTOCURRENCIES[
          currency as keyof typeof DEPOSIT_CRYPTOCURRENCIES
        ],
    });
  } catch (error) {
    console.error("Failed to get deposit address:", error);
    return NextResponse.json(
      { error: "Failed to get deposit address" },
      { status: 500 }
    );
  }
}
