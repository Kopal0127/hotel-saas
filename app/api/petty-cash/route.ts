import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = { hotelId: hotelId || undefined };
    if (type) where.type = type;
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }

    const entries = await prisma.pettyCash.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { hotelId, type, name, date, amount } = await req.json();
    if (!hotelId || !type || !name || !date || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }
    const entry = await prisma.pettyCash.create({
      data: { hotelId, type, name, date: new Date(date), amount: parseFloat(amount) },
    });
    return NextResponse.json({ message: "Entry add ho gayi!", entry }, { status: 201 });
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
    await prisma.pettyCash.delete({ where: { id } });
    return NextResponse.json({ message: "Delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}