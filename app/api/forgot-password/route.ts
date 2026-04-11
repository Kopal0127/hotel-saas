import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// 6 digit OTP generate karo
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, userType } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email daalo!" }, { status: 400 });
    }

    // ✅ Check karo user exist karta hai ya nahi
    let userExists = false;
    let userName = "";

    if (userType === "staff") {
      const staff = await prisma.staff.findUnique({ where: { email } });
      if (staff) { userExists = true; userName = staff.name; }
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) { userExists = true; userName = user.name; }
    }

    if (!userExists) {
      return NextResponse.json({ error: "Yeh email registered nahi hai!" }, { status: 404 });
    }

    // ✅ Purane OTPs delete karo
    await prisma.otpVerification.deleteMany({
      where: { email, type: "PASSWORD_RESET" }
    });

    // ✅ Naya OTP banao — 10 minute valid
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: { email, otp, type: "PASSWORD_RESET", expiresAt }
    });

    // ✅ Email bhejo
    await resend.emails.send({
      from: "bookings@nightstays.in",
      to: email,
      subject: "HotelPro — Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h1 style="color: #2563eb; text-align: center;">🔐 Password Reset</h1>
          <p>Dear <b>${userName}</b>,</p>
          <p>Tumhara password reset OTP yeh hai:</p>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #1e40af; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          <p style="color: #6b7280; font-size: 14px;">⏰ Yeh OTP <b>10 minutes</b> mein expire ho jayega.</p>
          <p style="color: #6b7280; font-size: 14px;">Agar tumne yeh request nahi ki toh ignore karo.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "OTP email pe bhej diya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}