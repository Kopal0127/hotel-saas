import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const items = await prisma.serviceItem.findMany({
      where: categoryId ? { categoryId } : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, name, itemCategory, price, minBaseline, stock } = body;

    if (!categoryId || !name || !itemCategory) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const stockNum = parseInt(stock) || 0;
    const minNum = parseInt(minBaseline) || 0;
    const status = stockNum <= minNum ? "LOW" : "NORMAL";

    const item = await prisma.serviceItem.create({
      data: {
        categoryId,
        name,
        itemCategory,
        price: parseFloat(price) || 0,
        minBaseline: minNum,
        stock: stockNum,
        status: status as any,
        stockUpdated: new Date(),
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, itemCategory, price, minBaseline, stock } = body;

    const stockNum = parseInt(stock) || 0;
    const minNum = parseInt(minBaseline) || 0;
    const status = stockNum <= minNum ? "LOW" : "NORMAL";

    const item = await prisma.serviceItem.update({
      where: { id },
      data: {
        name,
        itemCategory,
        price: parseFloat(price) || 0,
        minBaseline: minNum,
        stock: stockNum,
        status: status as any,
        stockUpdated: new Date(),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.serviceItem.delete({ where: { id } });
    return NextResponse.json({ message: "Item delete ho gaya!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}