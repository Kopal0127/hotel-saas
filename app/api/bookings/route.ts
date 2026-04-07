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
      include: { room: { include: { hotel: true } } },
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
    const { roomId, guestName, guestEmail, checkIn, checkOut, amount } = await req.json();

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
        amount: parseFloat(amount)
      },
      include: { room: { include: { hotel: true } } }
    });

    const checkInDate = new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const checkOutDate = new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const hotelName = booking.room.hotel.name;
    const roomNumber = booking.room.number;

    // Hotel Owner ko email
    try {
      await resend.emails.send({
        from: "HotelPro <onboarding@resend.dev>",
        to: process.env.HOTEL_OWNER_EMAIL || "dargudetushar@gmail.com",
        subject: `🏨 Naya Booking! — ${guestName} (Room #${roomNumber})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
            <div style="background: #1e40af; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0;">🏨 HotelPro</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Naya Booking Notification</p>
            </div>
            <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px;">
              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #15803d;">✅ Naya Booking Confirm!</h2>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Hotel</td>
                  <td style="padding: 12px 0; font-weight: bold;">${hotelName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Guest</td>
                  <td style="padding: 12px 0; font-weight: bold;">${guestName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Email</td>
                  <td style="padding: 12px 0;">${guestEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Room</td>
                  <td style="padding: 12px 0; font-weight: bold;">#${roomNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Check In</td>
                  <td style="padding: 12px 0;">${checkInDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Check Out</td>
                  <td style="padding: 12px 0;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280;">Amount</td>
                  <td style="padding: 12px 0; font-weight: bold; color: #16a34a; font-size: 20px;">₹${amount}</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://hotel-saas-gs98.vercel.app/dashboard/bookings"
                  style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  📋 Booking Dekho
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Owner email send nahi hua:", emailError);
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