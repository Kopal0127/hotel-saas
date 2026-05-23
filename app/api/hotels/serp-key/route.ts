import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotelId, serpApiKey } = body;

  if (!hotelId) {
    return NextResponse.json({ error: "hotelId required" }, { status: 400 });
  }

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { serpApiKey: serpApiKey || null },
  });

  return NextResponse.json({ success: true });
}