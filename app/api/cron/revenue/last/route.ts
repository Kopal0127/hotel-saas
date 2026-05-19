import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const hotels = await prisma.hotel.findMany();

    for (const hotel of hotels) {
      const settings = await prisma.revenueSettings.findUnique({ where: { hotelId: hotel.id } });
      if (!settings || !settings.isActive) continue;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id } });
      const roomTypes = [...new Set(rooms.map(r => r.type))];

      for (const roomType of roomTypes) {
        const typeRooms = rooms.filter(r => r.type === roomType);
        const totalRooms = typeRooms.length;

        const todayBookings = await prisma.booking.findMany({
          where: {
            checkIn: { gte: today, lt: tomorrow },
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
          },
          include: { bookingRooms: true }
        });

        const bookedRoomIds = new Set<string>();
        todayBookings.forEach(b => {
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

          if (unsoldPercent >= settings.lastUnsold && settings.lastDiscount > 0) {
            finalPrice = room.price - (room.price * settings.lastDiscount) / 100;
          } else if (bookedPercent >= settings.lastBooked && settings.lastMarkup > 0) {
            finalPrice = room.price + (room.price * settings.lastMarkup) / 100;
          }

          const existing = await prisma.ratePlan.findFirst({
            where: { channelId: null, roomId: room.id, date: today }
          });

          if (existing) {
            await prisma.ratePlan.update({
              where: { id: existing.id },
              data: { price: finalPrice, available: unsoldCount, isBlocked: false }
            });
          } else {
            await prisma.ratePlan.create({
              data: { channelId: null, roomId: room.id, date: today, price: finalPrice, available: unsoldCount, isBlocked: false }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Last minute slot processed!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed!" }, { status: 500 });
  }
}