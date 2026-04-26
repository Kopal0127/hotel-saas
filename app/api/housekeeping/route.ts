import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — Fetch housekeeping requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const status = searchParams.get("status");

    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;

    const requests = await prisma.housekeepingRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// POST — Create new housekeeping request
export async function POST(req: NextRequest) {
  try {
    const { hotelId, roomId, roomNumber, requestType, priority, notes } = await req.json();

    if (!hotelId || !roomId || !roomNumber) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const request = await prisma.housekeepingRequest.create({
      data: {
        hotelId,
        roomId,
        roomNumber,
        requestType: requestType || "CLEANING",
        priority: priority || "NORMAL",
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Request create ho gayi!", request }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// PUT — Update status
export async function PUT(req: NextRequest) {
  try {
    const { id, status, notes } = await req.json();

    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (status === "DONE") updateData.completedAt = new Date();

    const request = await prisma.housekeepingRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "Update ho gaya!", request });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update nahi ho saka!" }, { status: 500 });
  }
}

// DELETE — Delete request
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.housekeepingRequest.delete({ where: { id } });
    return NextResponse.json({ message: "Delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}