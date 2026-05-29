import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET — Fetch categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const categories = await prisma.inventoryCategory.findMany({
      where: { hotelId: hotelId || undefined },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// POST — Add new category
export async function POST(req: NextRequest) {
  try {
    const { hotelId, name } = await req.json();
    if (!hotelId || !name) {
      return NextResponse.json({ error: "Name aur hotelId chahiye!" }, { status: 400 });
    }
    const category = await prisma.inventoryCategory.create({
      data: { hotelId, name },
    });
    return NextResponse.json({ message: "Category add ho gayi!", category }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// DELETE — Delete category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });
    await prisma.inventoryCategory.delete({ where: { id } });
    return NextResponse.json({ message: "Category delete ho gayi!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}