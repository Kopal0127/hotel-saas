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

// GET — settings fetch karo
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const hotelId = searchParams.get("hotelId");
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });

  let settings = await prisma.revenueSettings.findUnique({ where: { hotelId } });

  // Agar settings nahi hain toh default create karo
  if (!settings) {
    settings = await prisma.revenueSettings.create({
      data: {
        hotelId,
        isActive: false,
        first12Discount: 0,
        first12Occupancy: 60,
        middleDiscount: 0,
        middleOccupancy: 40,
        lastDiscount: 0,
        lastOccupancy: 40,
      }
    });
  }

  return NextResponse.json({ settings });
}

// POST — settings save karo
export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    hotelId, isActive,
    nextDayDiscount, nextDayUnsold, nextDayMarkup, nextDayBooked,
    first12Discount, first12Unsold, first12Markup, first12Booked,
    middleDiscount, middleUnsold, middleMarkup, middleBooked,
    lastDiscount, lastUnsold, lastMarkup, lastBooked,
  } = body;

  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });

  const settings = await prisma.revenueSettings.upsert({
    where: { hotelId },
  update: {
      isActive,
      nextDayDiscount, nextDayUnsold, nextDayMarkup, nextDayBooked,
      first12Discount, first12Unsold, first12Markup, first12Booked,
      middleDiscount, middleUnsold, middleMarkup, middleBooked,
      lastDiscount, lastUnsold, lastMarkup, lastBooked,
    },
    create: {
      hotelId, isActive,
      nextDayDiscount, nextDayUnsold, nextDayMarkup, nextDayBooked,
      first12Discount, first12Unsold, first12Markup, first12Booked,
      middleDiscount, middleUnsold, middleMarkup, middleBooked,
      lastDiscount, lastUnsold, lastMarkup, lastBooked,
    }