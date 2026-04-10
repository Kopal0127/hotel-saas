import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const bookings = await prisma.booking.findMany({
      where: { room: { hotelId: hotelId || undefined } },
      include: { room: true },
      orderBy: { createdAt: "desc" }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      roomNumber: b.room.number,
      roomType: b.room.type,
      price: b.room.price
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      roomId, guestName, guestEmail, checkIn, checkOut, amount,
      notes, specialRequests, paymentMode, paymentAmount,
      finalPaymentMode, finalPaymentAmount
    } = await req.json();

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestEmail,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: "CONFIRMED",
        amount: parseFloat(amount),
        notes: notes || null,
        specialRequests: specialRequests || null,
        paymentMode: paymentMode || "CASH",
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        finalPaymentMode: finalPaymentMode || null,
        finalPaymentAmount: finalPaymentAmount ? parseFloat(finalPaymentAmount) : null,
      },
      include: { room: { include: { hotel: true } } }
    });

    // Email bhejo
    resend.emails.send({
      from: "bookings@nightstays.in",
      to: "dargudetushar@gmail.com",
      subject: `Naya Booking — ${guestName} Room #${booking.room.number}`,
      html: `
        <h2>Naya Booking Aaya!</h2>
        <p><b>Guest:</b> ${guestName}</p>
        <p><b>Email:</b> ${guestEmail}</p>
        <p><b>Hotel:</b> ${booking.room.hotel.name}</p>
        <p><b>Room:</b> #${booking.room.number}</p>
        <p><b>Check In:</b> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
        <p><b>Check Out:</b> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
        <p><b>Amount:</b> ₹${amount}</p>
        <p><b>Payment Mode:</b> ${paymentMode || "CASH"}</p>
        ${finalPaymentMode ? `<p><b>Final Payment:</b> ${finalPaymentMode} — ₹${finalPaymentAmount}</p>` : ""}
        ${specialRequests ? `<p><b>Special Requests:</b> ${specialRequests}</p>` : ""}
        ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}
      `,
    }).catch(e => console.error("Email error:", e));
    // ✅ Guest ko confirmation email
    if (guestEmail) {
      resend.emails.send({
        from: "bookings@nightstays.in",
        to: guestEmail,
        subject: `Booking Confirmed — ${booking.room.hotel.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h1 style="color: #2563eb; text-align: center;">🏨 Booking Confirmed!</h1>
            <p style="font-size: 16px;">Dear <b>${guestName}</b>,</p>
            <p>Your booking at <b>${booking.room.hotel.name}</b> has been confirmed!</p>
            
            <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Booking Details</h3>
              <p><b>Room:</b> #${booking.room.number} — ${booking.room.type}</p>
              <p><b>Check-in:</b> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
              <p><b>Check-out:</b> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
              <p><b>Total Amount:</b> ₹${amount}</p>
              <p><b>Payment Mode:</b> ${paymentMode || "CASH"}</p>
              ${specialRequests ? `<p><b>Special Requests:</b> ${specialRequests}</p>` : ""}
              ${finalPaymentMode === "CHECKOUT_PAYMENT" && finalPaymentAmount ? `
                <div style="background: #fff7ed; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; color: #c2410c;"><b>⚠️ Final Payment:</b> ₹${finalPaymentAmount} checkout pe dena hoga</p>
                </div>
              ` : ""}
            </div>

            <div style="background: #f0fff4; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #166534;">🏨 Hotel Details</h3>
              <p><b>${booking.room.hotel.name}</b></p>
              ${booking.room.hotel.address ? `<p>📍 ${booking.room.hotel.address}</p>` : ""}
              ${booking.room.hotel.phone ? `<p>📞 ${booking.room.hotel.phone}</p>` : ""}
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Thank you for choosing ${booking.room.hotel.name}. We look forward to welcoming you!
            </p>
          </div>
        `,
      }).catch(e => console.error("Guest email error:", e));
    }

    return NextResponse.json({ message: "Booking ho gayi!", id: booking.id }, { status: 201 });
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
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking delete ho gayi!" });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}