import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const serviceType = searchParams.get("serviceType");

    const categories = await prisma.serviceCategory.findMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        ...(serviceType ? { serviceType: serviceType as any } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelId, name, serviceType } = body;

    if (!hotelId || !name || !serviceType) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const category = await prisma.serviceCategory.create({
      data: { hotelId, name, serviceType },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name } = body;

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.serviceItem.deleteMany({ where: { categoryId: id } });
    await prisma.serviceCategory.delete({ where: { id } });

    return NextResponse.json({ message: "Category delete ho gayi!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}