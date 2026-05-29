import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET || "hotelpro-secret-key") as { userId: string };
  } catch {
    return null;
  }
}

// GET /api/rates?hotelId=&month=&year=&roomId=
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const hotelId = searchParams.get("hotelId");
  const month = parseInt(searchParams.get("month") || "");
  const year = parseInt(searchParams.get("year") || "");
  const roomId = searchParams.get("roomId");

  if (!hotelId || !month || !year) {
    return NextResponse.json({ error: "hotelId, month, year required" }, { status: 400 });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

 const ratePlans = await prisma.ratePlan.findMany({
    where: {
      OR: [
        { channel: { hotelId } },
        { channelId: null, roomId: { in: (await prisma.room.findMany({ where: { hotelId }, select: { id: true } })).map(r => r.id) } }
      ],
      date: { gte: startDate, lte: endDate },
      ...(roomId ? { roomId } : {}),
    },
    include: { room: true, channel: true },
    orderBy: { date: "asc" },
  });

  const rooms = await prisma.room.findMany({ where: { hotelId } });
  const channels = await prisma.otaChannel.findMany({ where: { hotelId } });

  // Har date ke liye booked rooms count
  const bookings = await prisma.booking.findMany({
    where: {
      room: { hotelId },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { lte: endDate },
      checkOut: { gte: startDate },
    },
    select: { roomId: true, checkIn: true, checkOut: true },
  });

  return NextResponse.json({ ratePlans, rooms, channels, bookings });
}

// POST /api/rates — Single ya bulk rate plan create/update
export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { channelId, roomId, date, price, available, isBlocked } = body;

  if (!roomId || !date) {
    return NextResponse.json({ error: "roomId, date required" }, { status: 400 });
  }

  const resolvedChannelId = (!channelId || channelId === "NO_OTA") ? null : channelId;

  const existing = await prisma.ratePlan.findFirst({
    where: { channelId: resolvedChannelId, roomId, date: new Date(date) }
  });

  const ratePlan = existing
    ? await prisma.ratePlan.update({
        where: { id: existing.id },
        data: {
          price: price ?? existing.price,
          available: available ?? existing.available,
          isBlocked: isBlocked ?? existing.isBlocked,
        },
      })
    : await prisma.ratePlan.create({
        data: {
          channelId: resolvedChannelId,
          roomId,
          date: new Date(date),
          price: price || 0,
          available: available ?? 1,
          isBlocked: isBlocked || false,
        },
      });

  return NextResponse.json({ success: true, ratePlan });
}

// PUT /api/rates — Bulk update (multiple dates ek saath)
export async function PUT(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { channelId, roomId, dates, price, available, isBlocked } = body;

  if (!channelId || !roomId || !dates?.length) {
    return NextResponse.json({ error: "channelId, roomId, dates[] required" }, { status: 400 });
  }

  const resolvedChannelId = (!channelId || channelId === "NO_OTA") ? null : channelId;

  // Null channelId (revenue manager wali rows) + OTA rows dono update karo
  const allChannelIds = [null, resolvedChannelId].filter((v, i, a) => a.indexOf(v) === i);

  const results = await Promise.all(
    dates.flatMap((date: string) =>
      allChannelIds.map(async (cId) => {
        const existing = await prisma.ratePlan.findFirst({
          where: { channelId: cId, roomId, date: new Date(date) },
        });

        if (existing) {
          return prisma.ratePlan.update({
            where: { id: existing.id },
            data: {
              price: price ?? existing.price,
              available: available ?? existing.available,
              isBlocked: isBlocked ?? existing.isBlocked,
            },
          });
        } else {
          return prisma.ratePlan.create({
            data: {
              channelId: cId,
              roomId,
              date: new Date(date),
              price: price || 0,
              available: available ?? 1,
              isBlocked: isBlocked || false,
            },
          });
        }
      })
    )
  );

  return NextResponse.json({ success: true, updated: results.length });
}