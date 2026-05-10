import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { hotelId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!hotelId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Saari details chahiye!" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { razorpayKeySecret: true },
    });

    if (!hotel?.razorpayKeySecret) {
      return NextResponse.json({ error: "Hotel ka payment gateway nahi mila!" }, { status: 400 });
    }

    // HMAC-SHA256 se signature verify karo
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", hotel.razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verify nahi hua — invalid signature!" }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification fail ho gaya!" }, { status: 500 });
  }
}