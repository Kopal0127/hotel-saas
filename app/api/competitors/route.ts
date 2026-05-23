import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — competitors fetch karo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelId = searchParams.get("hotelId");
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });

  const competitors = await prisma.competitor.findMany({
    where: { hotelId },
    include: { rates: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(competitors);
}

// POST — competitor add karo
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotelId, name, location } = body;
  if (!hotelId || !name || !location)
    return NextResponse.json({ error: "hotelId, name, location required" }, { status: 400 });

  const count = await prisma.competitor.count({ where: { hotelId } });
  if (count >= 8)
    return NextResponse.json({ error: "Max 8 competitors allowed" }, { status: 400 });

  const competitor = await prisma.competitor.create({
    data: { hotelId, name, location },
  });

  return NextResponse.json(competitor);
}

// DELETE — competitor delete karo
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.competitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
