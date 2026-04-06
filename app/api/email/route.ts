import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestEmail, roomNumber, checkIn, checkOut, amount, hotelName } = body;

    const checkInDate = new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const checkOutDate = new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Email to Hotel Owner
    await resend.emails.send({
      from: "HotelPro <onboarding@resend.dev>",
      to: process.env.HOTEL_OWNER_EMAIL || "dargudetushar@gmail.com",
      subject: `🏨 Naya Booking Aaya! — ${guestName} (Room #${roomNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: #1e40af; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏨 HotelPro</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Naya Booking Notification</p>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #15803d; font-size: 18px;">✅ Naya Booking Confirm!</h2>
              <p style="margin: 4px 0 0 0; color: #166534;">Ek naya booking aaya hai aapke hotel mein.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Hotel</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827;">${hotelName || "Your Hotel"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Guest Name</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827;">${guestName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Guest Email</td>
                <td style="padding: 12px 0; color: #111827;">${guestEmail}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Room</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827;">#${roomNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Check In</td>
                <td style="padding: 12px 0; color: #111827;">${checkInDate}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Check Out</td>
                <td style="padding: 12px 0; color: #111827;">${checkOutDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Amount</td>
                <td style="padding: 12px 0; font-weight: bold; color: #16a34a; font-size: 18px;">₹${amount}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://hotel-saas-gs98.vercel.app/dashboard/bookings" 
                style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                📋 Booking Dekho
              </a>
            </div>

            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
              HotelPro — Hotel Management System
            </p>
          </div>
        </div>
      `,
    });

    // Email to Guest
    await resend.emails.send({
      from: "HotelPro <onboarding@resend.dev>",
      to: guestEmail,
      subject: `✅ Booking Confirmed — ${hotelName || "Hotel"} (Room #${roomNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: #1e40af; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏨 HotelPro</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Booking Confirmation</p>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #111827;">Namaste ${guestName}! 🙏</h2>
            <p style="color: #6b7280;">Aapki booking confirm ho gayi hai. Neeche aapki booking details hain:</p>

            <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Hotel</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #1e40af;">${hotelName || "Your Hotel"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Room</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #111827;">#${roomNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Check In</td>
                  <td style="padding: 10px 0; color: #111827;">${checkInDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Check Out</td>
                  <td style="padding: 10px 0; color: #111827;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Total Amount</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #16a34a; font-size: 20px;">₹${amount}</td>
                </tr>
              </table>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Koi sawaal ho toh humse contact karein.</p>
            
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
              HotelPro — Hotel Management System
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Emails send ho gaye!" });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Email send nahi hua" }, { status: 500 });
  }
}