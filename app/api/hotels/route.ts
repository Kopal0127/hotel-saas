import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany()
    return NextResponse.json({ hotels });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { razorpayKeyId, razorpayKeySecret } = await req.json();
    const hotels = await prisma.hotel.findMany();
    if (!hotels || hotels.length === 0) {
      return NextResponse.json({ error: "Hotel nahi mila!" }, { status: 404 });
    }
    const hotel = await prisma.hotel.update({
      where: { id: hotels[0].id },
      data: {
        razorpayKeyId: razorpayKeyId || null,
        razorpayKeySecret: razorpayKeySecret || null,
      },
    });
    return NextResponse.json({ message: "Payment keys save ho gayi!", hotel });
  } catch (error) {
    return NextResponse.json({ error: "Save nahi ho saka!" }, { status: 500 });
  }
}