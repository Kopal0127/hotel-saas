import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const bookings = await prisma.booking.findMany({
      where: { room: { hotelId: hotelId || undefined } },
      include: { room: true },
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
      include: { room: { include: { hotel: true } } }
    });

    // Email bhejo
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "dargudetushar@gmail.com",
      subject: `Naya Booking — ${guestName} Room #${booking.room.number}`,
      html: `
        <h2>Naya Booking Aaya!</h2>
        <p><b>Guest:</b> ${guestName}</p>
        <p><b>Email:</b> ${guestEmail}</p>
        <p><b>Hotel:</b> ${booking.room.hotel.name}</p>
        <p><b>Room:</b> #${booking.room.number}</p>
        <p><b>Check In:</b> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
        <p><b>Check Out:</b> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
        <p><b>Amount:</b> ₹${amount}</p>
      `,
    }).catch(e => console.error("Email error:", e));

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