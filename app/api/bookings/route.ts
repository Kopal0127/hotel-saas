import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const bookings = await prisma.booking.findMany({
      where: {
        room: { hotelId: hotelId || undefined }
      },
      include: {
        room: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedBookings = bookings.map(b => ({
      ...b,
      roomNumber: b.room.number,
      roomType: b.room.type,
      price: b.room.price
    }))

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { roomId, guestName, guestEmail, checkIn, checkOut, amount } = await req.json();

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestEmail,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: 'CONFIRMED',
        amount: parseFloat(amount)
      }
    })

    return NextResponse.json({ message: "Booking ho gayi!", id: booking.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}