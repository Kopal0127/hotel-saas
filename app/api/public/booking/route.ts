import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      hotelId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      amount,
      rooms,
      specialRequests,
      extraMattress,
      razorpayPaymentId,
      razorpayOrderId,
    } = await req.json();

    if (!hotelId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab required fields bharo!" }, { status: 400 });
    }

    // Pehla room find karo
    const firstRoom = await prisma.room.findFirst({
      where: { hotelId, type: rooms[0].type },
    });

    if (!firstRoom) {
      return NextResponse.json({ error: "Room nahi mila!" }, { status: 404 });
    }

    // Booking create karo
    const booking = await prisma.booking.create({
      data: {
        roomId: firstRoom.id,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        amount: parseFloat(amount),
        status: "CONFIRMED",
        source: "BOOKING_ENGINE",
        paymentMode: "ONLINE",
        paymentAmount: parseFloat(amount),
        specialRequests: specialRequests || null,
        bookingRooms: {
          create: rooms.map((r: any) => ({
            roomId: firstRoom.id,
            adults: r.adults || 1,
            children: r.children || 0,
            infants: r.infants || 0,
            extraMattress: extraMattress || 0,
            roomPrice: r.price || 0,
          })),
        },
      },
    });

   // Guest ko confirmation email bhejo
    await resend.emails.send({
      from: "HotelPro <bookings@nightstays.in>",
      to: guestEmail,
      subject: `Booking Confirmed! #${booking.id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Booking Confirmed!</h2>
          <p>Dear <strong>${guestName}</strong>,</p>
          <p>Aapki booking confirm ho gayi hai. Details neeche hain:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Booking ID:</strong> #${booking.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
            <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
            <p><strong>Rooms:</strong> ${rooms.length}</p>
            <p><strong>Total Amount:</strong> ₹${amount}</p>
            ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ""}
          </div>
          <p>Koi sawaal ho toh humse contact karein.</p>
          <p style="color: #6b7280; font-size: 12px;">Powered by HotelPro</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Booking confirmed!", bookingId: booking.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Booking create nahi ho saki!" }, { status: 500 });
  }
}