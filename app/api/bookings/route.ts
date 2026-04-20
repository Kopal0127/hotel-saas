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
      roomId: b.roomId,
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
      finalPaymentMode, finalPaymentAmount, adults, children, source
    } = await req.json();

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    // ✅ Check 1: Room blocked hai ya nahi Rates & Availability mein
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check karo koi bhi date blocked toh nahi
    const blockedRates = await prisma.ratePlan.findMany({
      where: {
        roomId,
        isBlocked: true,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        }
      }
    });

    if (blockedRates.length > 0) {
      return NextResponse.json({
        error: `Yeh room ${new Date(blockedRates[0].date).toLocaleDateString("en-IN")} ko blocked hai! Pehle Rates & Availability mein unblock karo.`
      }, { status: 400 });
    }

    // ✅ Check 2: Available rooms 0 toh nahi
    const unavailableRates = await prisma.ratePlan.findMany({
      where: {
        roomId,
        available: 0,
        isBlocked: false,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        }
      }
    });

    if (unavailableRates.length > 0) {
      return NextResponse.json({
        error: `Yeh room ${new Date(unavailableRates[0].date).toLocaleDateString("en-IN")} ko available nahi hai! Rates & Availability check karo.`
      }, { status: 400 });
    }

    // ✅ Check 3: Koi existing booking toh nahi same dates pe
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ["CONFIRMED", "PENDING"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ]
      }
    });

    if (existingBooking) {
      return NextResponse.json({
        error: `Yeh room already ${new Date(existingBooking.checkIn).toLocaleDateString("en-IN")} se ${new Date(existingBooking.checkOut).toLocaleDateString("en-IN")} tak booked hai!`
      }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestEmail,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: "CONFIRMED",
        amount: parseFloat(amount),
        notes: notes || null,
        specialRequests: specialRequests || null,
        paymentMode: paymentMode || "CASH",
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        finalPaymentMode: finalPaymentMode || null,
        finalPaymentAmount: finalPaymentAmount ? parseFloat(finalPaymentAmount) : null,
        adults: adults ? parseInt(adults) : 1,
        children: children ? parseInt(children) : 0,
        source: source || "WALK_IN",
      },
      include: { room: { include: { hotel: true } } }
    });

    // ✅ Booking ke baad available rooms update karo
    const datesToUpdate: Date[] = [];
    const cur = new Date(checkInDate);
    while (cur < checkOutDate) {
      datesToUpdate.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    // Har date pe available -1 karo
    await Promise.all(datesToUpdate.map(async (date) => {
      const existing = await prisma.ratePlan.findFirst({
        where: {
          roomId,
          date: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          }
        }
      });
      if (existing && existing.available > 0) {
        await prisma.ratePlan.update({
          where: { id: existing.id },
          data: { available: existing.available - 1 }
        });
      }
    }));

    // Owner ko email
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

    // Guest ko email
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

    // ✅ Delete hone pe available +1 karo
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true }
    });

    if (booking) {
      const datesToUpdate: Date[] = [];
      const cur = new Date(booking.checkIn);
      while (cur < booking.checkOut) {
        datesToUpdate.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }

      await Promise.all(datesToUpdate.map(async (date) => {
        const existing = await prisma.ratePlan.findFirst({
          where: {
            roomId: booking.roomId,
            date: {
              gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
            }
          }
        });
        if (existing) {
          await prisma.ratePlan.update({
            where: { id: existing.id },
            data: { available: existing.available + 1 }
          });
        }
      }));
    }

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking delete ho gayi!" });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID aur status chahiye!" }, { status: 400 });
    }

    const validStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "UPGRADED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status!" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { room: true },
    });

    return NextResponse.json({ message: "Status update ho gaya!", booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Status update nahi ho saka!" }, { status: 500 });
  }
}