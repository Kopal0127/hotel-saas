import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword, userType } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password kam se kam 6 characters ka hona chahiye!" }, { status: 400 });
    }

    // ✅ OTP verify karo
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        type: "PASSWORD_RESET",
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP galat hai ya expire ho gaya!" }, { status: 400 });
    }

    // ✅ Password hash karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Password update karo
    if (userType === "staff") {
      await prisma.staff.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    }

    // ✅ OTP used mark karo
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    return NextResponse.json({ message: "Password successfully reset ho gaya! ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}