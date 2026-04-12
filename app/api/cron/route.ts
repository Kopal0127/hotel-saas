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