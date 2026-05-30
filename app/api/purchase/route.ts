import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const purchases = await prisma.purchase.findMany({
      where: { hotelId: hotelId || undefined },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { hotelId, itemName, category, date, amount } = await req.json();
    if (!hotelId || !itemName || !category || !date || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }
    const purchase = await prisma.purchase.create({
      data: { hotelId, itemName, category, date: new Date(date), amount: parseFloat(amount) },
    });
    return NextResponse.json({ message: "Purchase add ho gaya!", purchase }, { status: 201 });
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
    await prisma.purchase.delete({ where: { id } });
    return NextResponse.json({ message: "Delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}