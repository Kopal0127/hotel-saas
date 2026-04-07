import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const bookings = await prisma.booking.findMany({
      where: {
        room: { hotelId: hotelId || undefined }
      },
      include: {
        room: {
          include: { hotel: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      roomNumber: b.room.number,
      roomType: b.room.type,
      price: b.room.price
    }));

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

    // Booking create karo
    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestEmail,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: "CONFIRMED",
        amount: parseFloat(amount)
      },
      include: {
        room: {
          include: { hotel: true }
        }
      }
    });

    // Email notification bhejo (background mein — booking fail nahi hogi agar email fail ho)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hotel-saas-gs98.vercel.app"}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          roomNumber: booking.room.number,
          checkIn,
          checkOut,
          amount: parseFloat(amount),
          hotelName: booking.room.hotel.name,
        }),
      });
    } catch (emailError) {
      console.error("Email send nahi hua:", emailError);
      // Email fail ho toh bhi booking success rahegi
    }

    return NextResponse.json({ message: "Booking ho gayi!", id: booking.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking delete ho gayi!" });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}