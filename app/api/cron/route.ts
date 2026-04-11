import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Security check — sirf authorized requests
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "hotelpro-cron-secret";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hotels = await prisma.hotel.findMany({
      include: { channels: { where: { isConnected: true } } }
    });

    let totalPulled = 0;

    for (const hotel of hotels) {
      for (const channel of hotel.channels) {
        // Mock OTA pull — real API keys milne pe yahan real API call hogi
        const mockBookings = await mockPullFromOTA(channel.name, hotel.id);
        totalPulled += mockBookings;

        // Last sync time update karo
        await prisma.otaChannel.update({
          where: { id: channel.id },
          data: { lastSyncAt: new Date() }
        });

        // Sync log save karo
        await prisma.syncLog.create({
          data: {
            channelId: channel.id,
            type: "AVAILABILITY" as any,
            status: "SUCCESS",
            message: `Auto pull: ${mockBookings} bookings synced`
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto pull complete! ${totalPulled} bookings synced`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed!" }, { status: 500 });
  }
}

// Mock OTA pull function — real API keys milne pe replace karo
async function mockPullFromOTA(channelName: string, hotelId: string): Promise<number> {
  // Yahan real API call hogi:
  // Booking.com: GET /hotels/{hotel_id}/reservations
  // MakeMyTrip: GET /partner/bookings
  // Google Hotel Centre: GET /accounts/{account}/reservations
  console.log(`Pulling from ${channelName} for hotel ${hotelId}...`);
  return 0; // Mock: 0 new bookings
}