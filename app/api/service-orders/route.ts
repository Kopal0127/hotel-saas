import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — Fetch orders (by bookingId, hotelId, kitchenStatus, paymentStatus)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const hotelId = searchParams.get("hotelId");
    const kitchenStatus = searchParams.get("kitchenStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const serviceType = searchParams.get("serviceType");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (hotelId) where.hotelId = hotelId;
    if (kitchenStatus) where.kitchenStatus = kitchenStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (serviceType) where.serviceType = serviceType;

    const orders = await prisma.serviceOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// POST — Create new order (KOT)
export async function POST(req: NextRequest) {
  try {
    const {
      bookingId, hotelId, roomNumber, guestName,
      items, // [{ itemId, itemName, itemCategory, price, quantity }]
      discount, notes, paymentMethod, serviceType
    } = await req.json();

    if (!hotelId || !roomNumber || !guestName || !items || items.length === 0) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    // Calculate totals
    const totalAmount = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    const discountVal = parseFloat(discount) || 0;
    const discountAmount = Math.round(totalAmount * discountVal / 100);
    const finalAmount = totalAmount - discountAmount;

    // Payment status
    const paymentStatus = paymentMethod === "Due" ? "UNPAID" : "PAID";
    const paidAt = paymentStatus === "PAID" ? new Date() : null;

    const order = await prisma.serviceOrder.create({
      data: {
        bookingId: bookingId || null,
        hotelId,
        roomNumber,
        guestName,
        totalAmount,
        discount: discountVal,
        finalAmount,
        notes: notes || null,
        paymentMethod: paymentMethod || "Due",
        paymentStatus,
        kitchenStatus: "PENDING",
        serviceType: serviceType || "FOOD",
        paidAt,
        items: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            itemName: i.itemName,
            itemCategory: i.itemCategory || "",
            price: parseFloat(i.price),
            quantity: parseInt(i.quantity),
            subtotal: parseFloat(i.price) * parseInt(i.quantity),
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json({ message: "Order save ho gaya!", order }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// PUT — Update status (kitchenStatus or paymentStatus)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, kitchenStatus, paymentStatus, paymentMethod } = body;

    if (!id) return NextResponse.json({ error: "Order ID chahiye!" }, { status: 400 });

    const updateData: any = {};
    if (kitchenStatus) {
      updateData.kitchenStatus = kitchenStatus;
      if (kitchenStatus === "DELIVERED") updateData.deliveredAt = new Date();
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID") updateData.paidAt = new Date();
    }
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const order = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: { items: true }
    });

    return NextResponse.json({ message: "Order update ho gaya!", order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update nahi ho saka!" }, { status: 500 });
  }
}

// DELETE — Cancel order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    await prisma.serviceOrder.delete({ where: { id } });
    return NextResponse.json({ message: "Order delete ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}