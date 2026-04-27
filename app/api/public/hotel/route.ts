import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    if (!hotelId) {
      return NextResponse.json({ error: "hotelId chahiye!" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel nahi mila!" }, { status: 404 });
    }

    return NextResponse.json({ hotel });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}