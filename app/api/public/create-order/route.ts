import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { hotelId, amount } = await req.json();

    if (!hotelId || !amount) {
      return NextResponse.json({ error: "hotelId aur amount chahiye!" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { razorpayKeyId: true, razorpayKeySecret: true },
    });

    if (!hotel?.razorpayKeyId || !hotel?.razorpayKeySecret) {
      return NextResponse.json({ error: "Payment gateway configure nahi hai!" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: hotel.razorpayKeyId,
      key_secret: hotel.razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: hotel.razorpayKeyId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Order create nahi ho saka!" }, { status: 500 });
  }
}