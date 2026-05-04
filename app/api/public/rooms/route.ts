import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!hotelId) {
      return NextResponse.json({ error: "hotelId chahiye!" }, { status: 400 });
    }

    if (!checkIn || !checkOut) {
      const allRooms = await prisma.room.findMany({
        where: { hotelId },
        select: {
          id: true,
          number: true,
          type: true,
          price: true,
          maxAdults: true,
          maxChildren: true,
          maxInfants: true,
          defaultAdultStay: true,
          defaultChildStay: true,
          defaultInfantStay: true,
          extraMattressLimit: true,
          extraMattressRate: true,
          bedType: true,
          roomSize: true,
          roomView: true,
        }
      });
      return NextResponse.json({ rooms: allRooms });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const allRooms = await prisma.room.findMany({
      where: { hotelId },
      select: {
        id: true,
        number: true,
        type: true,
        price: true,
        maxAdults: true,
        maxChildren: true,
        maxInfants: true,
        defaultAdultStay: true,
        defaultChildStay: true,
        defaultInfantStay: true,
        extraMattressLimit: true,
        extraMattressRate: true,
        bedType: true,
        roomSize: true,
        roomView: true,
      }
    });

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

    const bookedRoomIds = new Set<string>();
    bookedBookings.forEach((b) => {
      if (b.bookingRooms.length > 0) {
        b.bookingRooms.forEach((br) => bookedRoomIds.add(br.roomId));
      } else {
        bookedRoomIds.add(b.roomId);
      }
    });

    const availableRooms = allRooms.filter((r) => !bookedRoomIds.has(r.id));

    return NextResponse.json({ rooms: availableRooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}