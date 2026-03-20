import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, hotelName } = await req.json();

    if (!name || !email || !password || !hotelName) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ error: "Yeh email pehle se registered hai!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'HOTEL_OWNER',
        hotels: {
          create: {
            name: hotelName,
          }
        }
      }
    });

    return NextResponse.json(
      { message: "Account ban gaya! Ab login karo.", userId: user.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}