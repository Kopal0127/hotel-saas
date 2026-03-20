import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock Razorpay payment create
export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount, guestName, guestEmail } = await req.json()

    // Mock Razorpay order (baad mein real API se replace)
    const mockOrderId = 'order_' + Date.now()
    const mockPaymentId = 'pay_' + Math.random().toString(36).substr(2, 9)

    // Payment record save karo
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: 'INR',
        status: 'PENDING',
        orderId: mockOrderId,
        guestName,
        guestEmail,
      }
    })

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      paymentId: payment.id,
      amount,
      currency: 'INR',
      // Mock Razorpay response
      razorpayKey: 'rzp_test_mock_key',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Payment verify karo
export async function PUT(req: NextRequest) {
  try {
    const { paymentId, razorpayPaymentId, status } = await req.json()

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status === 'success' ? 'COMPLETED' : 'FAILED',
        razorpayId: razorpayPaymentId,
        paidAt: new Date(),
      }
    })

    return NextResponse.json({ success: true, payment })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Payments list
export async function GET(req: NextRequest) {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ payments })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}