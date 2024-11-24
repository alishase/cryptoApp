import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WELCOME_PROMO_CODE = "WELCOME250";
const WELCOME_BONUS_AMOUNT = 250;

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, promoCode } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and initial wallets in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
        },
      });

      // Create default BTC wallet
      await prisma.wallet.create({
        data: {
          userId: user.id,
          currency: "BTC",
          balance: 0,
          address: `btc-${Math.random().toString(36).substring(2, 15)}`,
        },
      });

      // Create USDT wallet
      const usdtWallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          currency: "USDT",
          balance: promoCode === WELCOME_PROMO_CODE ? WELCOME_BONUS_AMOUNT : 0,
          address: `usdt-${Math.random().toString(36).substring(2, 15)}`,
        },
      });

      // If promo code is valid, handle promo code logic
      let promoApplied = false;
      if (promoCode === WELCOME_PROMO_CODE) {
        // Get or create promo code
        let promoCodeRecord = await prisma.promoCode.findFirst({
          where: { code: WELCOME_PROMO_CODE },
        });

        if (!promoCodeRecord) {
          promoCodeRecord = await prisma.promoCode.create({
            data: {
              code: WELCOME_PROMO_CODE,
              discount: WELCOME_BONUS_AMOUNT,
              validUntil: new Date("2025-12-31"),
              usageLimit: 999999,
              usageCount: 0,
            },
          });
        }

        // Record promo usage
        await prisma.promoUsage.create({
          data: {
            userId: user.id,
            promoCodeId: promoCodeRecord.id,
          },
        });

        // Update usage count
        await prisma.promoCode.update({
          where: { id: promoCodeRecord.id },
          data: { usageCount: { increment: 1 } },
        });

        // Record the bonus transaction
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "BONUS",
            amount: WELCOME_BONUS_AMOUNT,
            currency: "USDT",
            status: "COMPLETED",
            walletId: usdtWallet.id,
          },
        });

        promoApplied = true;
      }

      return { user, promoApplied };
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        promoApplied: result.promoApplied,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
