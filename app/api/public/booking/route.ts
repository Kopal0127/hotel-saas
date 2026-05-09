import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const {
      hotelId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      amount,
      rooms,
      specialRequests,
      extraMattress,
      razorpayPaymentId,
      razorpayOrderId,
    } = await req.json();

    if (!hotelId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab required fields bharo!" }, { status: 400 });
    }

    // Pehla room find karo
    const firstRoom = await prisma.room.findFirst({
      where: { hotelId, type: rooms[0].type },
    });

    if (!firstRoom) {
      return NextResponse.json({ error: "Room nahi mila!" }, { status: 404 });
    }

    // Booking create karo
    const booking = await prisma.booking.create({
      data: {
        roomId: firstRoom.id,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        amount: parseFloat(amount),
        status: "CONFIRMED",
        source: "BOOKING_ENGINE",
        paymentMode: "ONLINE",
        paymentAmount: parseFloat(amount),
        specialRequests: specialRequests || null,
        bookingRooms: {
          create: rooms.map((r: any) => ({
            roomId: firstRoom.id,
            adults: r.adults || 1,
            children: r.children || 0,
            infants: r.infants || 0,
            extraMattress: extraMattress || 0,
            roomPrice: r.price || 0,
          })),
        },
      },
    });

    return NextResponse.json({ message: "Booking confirmed!", bookingId: booking.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Booking create nahi ho saki!" }, { status: 500 });
  }
}