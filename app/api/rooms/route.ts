import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const rooms = await prisma.room.findMany({
      where: hotelId ? { hotelId } : {},
      orderBy: { number: 'asc' }
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { number, type, price, hotelId } = await req.json();

    if (!number || !type || !price || !hotelId) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        number,
        type,
        price: parseFloat(price),
        hotelId
      }
    });

    return NextResponse.json({ message: "Room add ho gaya!", id: room.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}