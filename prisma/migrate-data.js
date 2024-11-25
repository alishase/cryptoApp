const { PrismaClient: SQLitePrisma } = require("@prisma/client");
const { PrismaClient: PostgresPrisma } = require("@prisma/client");

// Initialize both clients
const sqliteClient = new SQLitePrisma({
  datasources: { url: "file:./dev.db" },
});

const postgresClient = new PostgresPrisma();

async function migrateData() {
  try {
    console.log("Starting migration...");

    // Migrate Users
    console.log("Migrating users...");
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: "USER",
          isVerified: false,
        },
      });
    }

    // Migrate Wallets
    console.log("Migrating wallets...");
    const wallets = await sqliteClient.wallet.findMany();
    for (const wallet of wallets) {
      await postgresClient.wallet.create({
        data: {
          id: wallet.id,
          userId: wallet.userId,
          currency: wallet.currency,
          balance: wallet.balance,
          address: wallet.address,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          type: "SPOT",
        },
      });
    }

    // Migrate Transactions
    console.log("Migrating transactions...");
    const transactions = await sqliteClient.transaction.findMany();
    for (const transaction of transactions) {
      await postgresClient.transaction.create({
        data: {
          id: transaction.id,
          userId: transaction.userId,
          walletId: transaction.walletId,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          fromAddress: transaction.fromAddress,
          toAddress: transaction.toAddress,
          createdAt: transaction.createdAt,
          updatedAt: new Date(),
          fee: 0,
        },
      });
    }

    // Migrate Promo Codes
    console.log("Migrating promo codes...");
    const promoCodes = await sqliteClient.promoCode.findMany();
    for (const promoCode of promoCodes) {
      await postgresClient.promoCode.create({
        data: {
          id: promoCode.id,
          code: promoCode.code,
          discount: promoCode.discount,
          validUntil: promoCode.validUntil,
          usageLimit: promoCode.usageLimit,
          usageCount: promoCode.usageCount,
          createdAt: promoCode.createdAt,
          updatedAt: new Date(),
          type: "WELCOME",
          isActive: true,
        },
      });
    }

    // Migrate Promo Usage
    console.log("Migrating promo usage...");
    const promoUsages = await sqliteClient.promoUsage.findMany();
    for (const promoUsage of promoUsages) {
      await postgresClient.promoUsage.create({
        data: {
          id: promoUsage.id,
          userId: promoUsage.userId,
          promoCodeId: promoUsage.promoCodeId,
          usedAt: promoUsage.usedAt,
          amountApplied: 250, // Default for existing WELCOME promo
          currency: "USDT",
          status: "COMPLETED",
        },
      });
    }

    // Migrate Support Chats
    console.log("Migrating support chats...");
    const supportChats = await sqliteClient.supportChat.findMany();
    for (const chat of supportChats) {
      await postgresClient.supportChat.create({
        data: {
          id: chat.id,
          userId: chat.userId,
          status: chat.status,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          priority: "NORMAL",
          category: "GENERAL",
        },
      });
    }

    // Migrate Messages
    console.log("Migrating messages...");
    const messages = await sqliteClient.message.findMany();
    for (const message of messages) {
      await postgresClient.message.create({
        data: {
          id: message.id,
          chatId: message.chatId,
          content: message.content,
          isFromSupport: message.isFromSupport,
          createdAt: message.createdAt,
          updatedAt: new Date(),
          attachments: [],
        },
      });
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run migration
migrateData().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
