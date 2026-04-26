import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — Fetch inventory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const items = await prisma.inventory.findMany({
      where: { hotelId: hotelId || undefined },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// POST — Add new item
export async function POST(req: NextRequest) {
  try {
    const { hotelId, itemName, description, category, quantity, status } = await req.json();

    if (!hotelId || !itemName) {
      return NextResponse.json({ error: "Item name aur hotelId chahiye!" }, { status: 400 });
    }

    const item = await prisma.inventory.create({
      data: {
        hotelId,
        itemName,
        description: description || null,
        category: category || "General",
        quantity: parseInt(quantity) || 0,
        status: status || "IN_STOCK",
      },
    });

    return NextResponse.json({ message: "Item add ho gaya!", item }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// PUT — Update item
export async function PUT(req: NextRequest) {
  try {
    const { id, itemName, description, category, quantity, status } = await req.json();

    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        itemName,
        description,
        category,
        quantity: parseInt(quantity),
        status,
      },
    });

    return NextResponse.json({ message: "Update ho gaya!", item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update nahi ho saka!" }, { status: 500 });
  }
}

// DELETE — Delete item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.inventory.delete({ where: { id } });
    return NextResponse.json({ message: "Item delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}