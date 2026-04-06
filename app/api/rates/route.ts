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
      channel: { hotelId },
      date: { gte: startDate, lte: endDate },
      ...(roomId ? { roomId } : {}),
    },
    include: { room: true, channel: true },
    orderBy: { date: "asc" },
  });

  const rooms = await prisma.room.findMany({ where: { hotelId } });
  const channels = await prisma.otaChannel.findMany({ where: { hotelId } });

  return NextResponse.json({ ratePlans, rooms, channels });
}

// POST /api/rates — Single ya bulk rate plan create/update
export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { channelId, roomId, date, price, available, isBlocked } = body;

  if (!channelId || !roomId || !date) {
    return NextResponse.json({ error: "channelId, roomId, date required" }, { status: 400 });
  }

  const ratePlan = await prisma.ratePlan.upsert({
    where: {
      // Composite unique check via findFirst then upsert workaround
      id: (await prisma.ratePlan.findFirst({ where: { channelId, roomId, date: new Date(date) } }))?.id || "new",
    },
    update: {
      price: price ?? undefined,
      available: available ?? undefined,
      isBlocked: isBlocked ?? undefined,
    },
    create: {
      channelId,
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

  const results = await Promise.all(
    dates.map(async (date: string) => {
      const existing = await prisma.ratePlan.findFirst({
        where: { channelId, roomId, date: new Date(date) },
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
            channelId,
            roomId,
            date: new Date(date),
            price: price || 0,
            available: available ?? 1,
            isBlocked: isBlocked || false,
          },
        });
      }
    })
  );

  return NextResponse.json({ success: true, updated: results.length });
}