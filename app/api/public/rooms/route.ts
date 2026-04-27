import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json({ error: "hotelId, checkIn, checkOut chahiye!" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Sab rooms fetch karo
    const allRooms = await prisma.room.findMany({
      where: { hotelId },
    });

    // Booked rooms find karo
    const bookedBookings = await prisma.booking.findMany({
      where: {
        room: { hotelId },
        status: { in: ["CONFIRMED", "PENDING", "CHECKED_IN"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
      include: {
        bookingRooms: true,
      },
    });

    // Booked room IDs
    const bookedRoomIds = new Set<string>();
    bookedBookings.forEach((b) => {
      if (b.bookingRooms.length > 0) {
        b.bookingRooms.forEach((br) => bookedRoomIds.add(br.roomId));
      } else {
        bookedRoomIds.add(b.roomId);
      }
    });

    // Available rooms
    const availableRooms = allRooms.filter((r) => !bookedRoomIds.has(r.id));

    return NextResponse.json({ rooms: availableRooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}