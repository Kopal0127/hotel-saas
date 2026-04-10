import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimiter";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // IP address lo
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Rate limit check
    const rateLimit = await checkRateLimit(`owner_login_${ip}`);
    if (!rateLimit.success) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email aur password bharo!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email ya password galat hai!" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Email ya password galat hai!" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "hotelpro-secret-key",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful!",
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}