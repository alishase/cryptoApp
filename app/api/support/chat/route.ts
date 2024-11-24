import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    const userId = session.user.id;

    // Find or create support chat
    let chat = await prisma.supportChat.findFirst({
      where: {
        userId,
        status: "OPEN",
      },
    });

    if (!chat) {
      chat = await prisma.supportChat.create({
        data: {
          userId,
          status: "OPEN",
        },
      });
    }

    // Add message to chat
    const newMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        isFromSupport: false,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Support chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
