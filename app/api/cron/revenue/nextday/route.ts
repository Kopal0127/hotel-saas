import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const hotels = await prisma.hotel.findMany();

    for (const hotel of hotels) {
      const settings = await prisma.revenueSettings.findUnique({ where: { hotelId: hotel.id } });
      if (!settings || !settings.isActive) continue;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id } });
      const roomTypes = [...new Set(rooms.map(r => r.type))];

      for (const roomType of roomTypes) {
        const typeRooms = rooms.filter(r => r.type === roomType);
        const totalRooms = typeRooms.length;

        const tomorrowBookings = await prisma.booking.findMany({
          where: {
            checkIn: { lte: tomorrowEnd },
            checkOut: { gt: tomorrow },
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
          },
          include: { bookingRooms: true }
        });

        const bookedRoomIds = new Set<string>();
        tomorrowBookings.forEach(b => {
          b.bookingRooms.forEach((br: any) => {
            if (typeRooms.find(r => r.id === br.roomId)) bookedRoomIds.add(br.roomId);
          });
        });

        const bookedCount = bookedRoomIds.size;
        const unsoldCount = totalRooms - bookedCount;
        const unsoldPercent = (unsoldCount / totalRooms) * 100;
        const bookedPercent = (bookedCount / totalRooms) * 100;

       for (const room of typeRooms) {
          let finalPrice = room.price;

          if (unsoldPercent >= settings.nextDayUnsold && settings.nextDayDiscount > 0) {
            finalPrice = room.price - (room.price * settings.nextDayDiscount) / 100;
          } else if (bookedPercent >= settings.nextDayBooked && settings.nextDayMarkup > 0) {
            finalPrice = room.price + (room.price * settings.nextDayMarkup) / 100;
          }

          const existing = await prisma.ratePlan.findFirst({
            where: { channelId: null, roomId: room.id, date: tomorrow }
          });

          if (existing) {
            await prisma.ratePlan.update({
              where: { id: existing.id },
              data: { price: finalPrice, available: unsoldCount, isBlocked: false }
            });
          } else {
            await prisma.ratePlan.create({
              data: { channelId: null, roomId: room.id, date: tomorrow, price: finalPrice, available: unsoldCount, isBlocked: false }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Next Day slot processed!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed!" }, { status: 500 });
  }
}