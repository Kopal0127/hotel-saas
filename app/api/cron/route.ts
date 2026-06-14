import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Mock OTA Ranking Data — Real API baad mein replace karega
const MOCK_OTA_RANKINGS = {
  BOOKING_COM: {
    propertyRanking: Math.floor(Math.random() * 20) + 1,
    reviewScore: (Math.random() * 2 + 7).toFixed(1),
    totalReviews: Math.floor(Math.random() * 50) + 100,
    profileScore: Math.floor(Math.random() * 10) + 85,
    cancellationPolicy: "Free Cancellation (24hrs)",
    currentCommission: "15%",
    conversionRate: (Math.random() * 2 + 3).toFixed(1) + "%",
  },
  MAKEMYTRIP: {
    propertyRanking: Math.floor(Math.random() * 15) + 1,
    reviewScore: (Math.random() * 1 + 3.5).toFixed(1),
    totalReviews: Math.floor(Math.random() * 30) + 70,
    profileScore: Math.floor(Math.random() * 10) + 80,
    cancellationPolicy: "Non-Refundable",
    currentCommission: "12%",
    conversionRate: (Math.random() * 2 + 2.5).toFixed(1) + "%",
  },
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
      const hotels = await prisma.hotel.findMany({
      include: { channels: { where: { isConnected: true } } }
    });

    let totalPulled = 0;

    for (const hotel of hotels) {
      for (const channel of hotel.channels) {
        // ✅ OTA Bookings Pull
        const mockBookings = await mockPullFromOTA(channel.name, hotel.id);
        totalPulled += mockBookings;

        // Last sync time update karo
        await prisma.otaChannel.update({
          where: { id: channel.id },
          data: { lastSyncAt: new Date() }
        });

        // ✅ Sync log save karo
        await prisma.syncLog.create({
          data: {
            channelId: channel.id,
            type: "AVAILABILITY" as any,
            status: "SUCCESS",
            message: `Daily auto update: ${new Date().toLocaleDateString("en-IN")}`
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily update complete! ${totalPulled} bookings synced`,
      rankings: MOCK_OTA_RANKINGS,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed!" }, { status: 500 });
  }
}

async function mockPullFromOTA(channelName: string, hotelId: string): Promise<number> {
  console.log(`Daily update: ${channelName} for hotel ${hotelId}...`);
  return 0;
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelId, timeSlot } = body;

    if (!hotelId || !timeSlot) {
      return NextResponse.json({ error: "hotelId, timeSlot required" }, { status: 400 });
    }

    // Revenue settings fetch karo
    const settings = await prisma.revenueSettings.findUnique({ where: { hotelId } });
    if (!settings || !settings.isActive) {
      return NextResponse.json({ message: "Revenue Manager inactive hai" });
    }

    // Rooms fetch karo
    const rooms = await prisma.room.findMany({ where: { hotelId } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

   // Next Day ya Today ki bookings fetch karo
    const targetDate = timeSlot === "nextDay" ? tomorrow : today;
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1);

    const todayBookings = await prisma.booking.findMany({
      where: {
        checkIn: { gte: targetDate, lt: targetDateEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
      include: { bookingRooms: true }
    });

    // Room type wise group karo
    const roomTypes = [...new Set(rooms.map(r => r.type))];

    for (const roomType of roomTypes) {
      const typeRooms = rooms.filter(r => r.type === roomType);
      const totalRooms = typeRooms.length;

      // Booked rooms count karo
      const bookedRoomIds = new Set<string>();
      todayBookings.forEach(b => {
        b.bookingRooms.forEach((br: any) => {
          if (typeRooms.find(r => r.id === br.roomId)) {
            bookedRoomIds.add(br.roomId);
          }
        });
      });

      const bookedCount = bookedRoomIds.size;
      const unsoldCount = totalRooms - bookedCount;
      const unsoldPercent = (unsoldCount / totalRooms) * 100;

      // Time slot ke hisaab se discount aur occupancy threshold lo
      let discount = 0;
      let threshold = 0;

    let markup = 0;
      let bookedThreshold = 0;

      if (timeSlot === "nextDay") {
        discount = settings.nextDayDiscount;
        threshold = settings.nextDayUnsold;
        markup = settings.nextDayMarkup;
        bookedThreshold = settings.nextDayBooked;
      } else if (timeSlot === "first12") {
        discount = settings.first12Discount;
        threshold = settings.first12Unsold;
        markup = settings.first12Markup;
        bookedThreshold = settings.first12Booked;
      } else if (timeSlot === "middle") {
        discount = settings.middleDiscount;
        threshold = settings.middleUnsold;
        markup = settings.middleMarkup;
        bookedThreshold = settings.middleBooked;
      } else if (timeSlot === "last") {
        discount = settings.lastDiscount;
        threshold = settings.lastUnsold;
        markup = settings.lastMarkup;
        bookedThreshold = settings.lastBooked;
      }

     const bookedPercent = (bookedCount / totalRooms) * 100;

      // Final price decide karo
      let finalPrice: number | null = null;
      let action = "none";

      if (unsoldPercent >= threshold && discount > 0) {
        // Discount apply
        action = "discount";
      } else if (bookedPercent >= bookedThreshold && markup > 0) {
        // Markup apply
        action = "markup";
      } else {
        // Neutral zone — base price restore
        action = "base";
      }

      // Har room pe apply karo
      for (const room of typeRooms) {
        if (action === "discount") {
          finalPrice = room.price - (room.price * discount) / 100;
        } else if (action === "markup") {
          finalPrice = room.price + (room.price * markup) / 100;
        } else {
          finalPrice = room.price; // Base price restore
        }

        const targetDateStr = targetDate.toISOString().split("T")[0];
        const existing = await prisma.ratePlan.findFirst({
          where: { channelId: null, roomId: room.id, date: targetDate }
        });

        if (existing) {
          await prisma.ratePlan.update({
            where: { id: existing.id },
            data: { price: finalPrice, available: unsoldCount, isBlocked: false }
          });
        } else {
          await prisma.ratePlan.create({
            data: {
              channelId: null,
              roomId: room.id,
              date: targetDate,
              price: finalPrice,
              available: unsoldCount,
              isBlocked: false,
            }
          });
        }
      }

      console.log(`✅ ${roomType}: ${action} apply kiya — price updated`);
    }

    return NextResponse.json({ success: true, message: `${timeSlot} slot processed!` });

  } catch (error) {
    console.error("Revenue cron error:", error);
    return NextResponse.json({ error: "Revenue cron failed!" }, { status: 500 });
  }
}