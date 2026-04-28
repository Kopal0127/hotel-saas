import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const rooms = await prisma.room.findMany({
      where: hotelId ? { hotelId } : {},
      orderBy: { number: "asc" },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
   const {
      type, price, hotelId, startNumber, totalRooms,
      taxGroup, sacCode,
      defaultAdultStay, defaultChildStay, defaultInfantStay,
      maxAdults, maxChildren, maxInfants,
      extraAdultRate, extraChildRate, extraInfantRate,
      bedType, roomSize, roomView,
    } = await req.json();

    if (!type || !price || !hotelId || !startNumber || !totalRooms) {
      return NextResponse.json({ error: "Sab required fields bharo!" }, { status: 400 });
    }

    const start = parseInt(startNumber);
    const total = parseInt(totalRooms);

    if (isNaN(start) || isNaN(total) || total <= 0) {
      return NextResponse.json({ error: "Room number aur total rooms sahi daalo!" }, { status: 400 });
    }

    const roomsToCreate = [];
    for (let i = 0; i < total; i++) {
      roomsToCreate.push({
        number: String(start + i),
        type,
        price: parseFloat(price),
        hotelId,
        taxGroup: taxGroup || null,
        sacCode: sacCode || null,
       defaultAdultStay: defaultAdultStay ? parseInt(defaultAdultStay) : 1,
        defaultChildStay: defaultChildStay ? parseInt(defaultChildStay) : 0,
        defaultInfantStay: defaultInfantStay ? parseInt(defaultInfantStay) : 0,
        // Max = Default (Default value hi max hai)
        maxAdults: defaultAdultStay ? parseInt(defaultAdultStay) : 1,
        maxChildren: defaultChildStay ? parseInt(defaultChildStay) : 0,
        maxInfants: defaultInfantStay ? parseInt(defaultInfantStay) : 0,
        extraAdultRate: extraAdultRate ? parseFloat(extraAdultRate) : 0,
        extraChildRate: extraChildRate ? parseFloat(extraChildRate) : 0,
        extraInfantRate: extraInfantRate ? parseFloat(extraInfantRate) : 0,
        bedType: bedType || null,
        roomSize: roomSize || null,
        roomView: roomView || null,
      });
    }

    const existingRooms = await prisma.room.findMany({
      where: {
        hotelId,
        number: { in: roomsToCreate.map((r) => r.number) },
      },
    });

    if (existingRooms.length > 0) {
      const existing = existingRooms.map((r) => r.number).join(", ");
      return NextResponse.json(
        { error: `Yeh rooms already exist hain: ${existing}` },
        { status: 400 }
      );
    }

    await prisma.room.createMany({ data: roomsToCreate });

    return NextResponse.json(
      { message: `${total} rooms successfully add ho gaye! (${start} to ${start + total - 1})` },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

   await prisma.room.delete({ where: { id } });
    return NextResponse.json({ message: "Room delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const {
      id, type, price, taxGroup, sacCode,
      defaultAdultStay, defaultChildStay, defaultInfantStay,
      extraAdultRate, extraChildRate, extraInfantRate,
      bedType, roomSize, roomView,
    } = await req.json();

    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    const room = await prisma.room.update({
      where: { id },
      data: {
        type,
        price: parseFloat(price),
        taxGroup: taxGroup || null,
        sacCode: sacCode || null,
        defaultAdultStay: parseInt(defaultAdultStay) || 1,
        defaultChildStay: parseInt(defaultChildStay) || 0,
        defaultInfantStay: parseInt(defaultInfantStay) || 0,
        maxAdults: parseInt(defaultAdultStay) || 1,
        maxChildren: parseInt(defaultChildStay) || 0,
        maxInfants: parseInt(defaultInfantStay) || 0,
        extraAdultRate: parseFloat(extraAdultRate) || 0,
        extraChildRate: parseFloat(extraChildRate) || 0,
        extraInfantRate: parseFloat(extraInfantRate) || 0,
        bedType: bedType || null,
        roomSize: roomSize || null,
        roomView: roomView || null,
      },
    });

    return NextResponse.json({ message: "Room update ho gaya!", room });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update nahi ho saka!" }, { status: 500 });
  }
}