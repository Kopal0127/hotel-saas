import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email aur password daalo!" }, { status: 400 });
    }

    // Staff dhundo
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { hotel: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Email ya password galat hai!" }, { status: 401 });
    }

    // Password check
    const isValid = await bcrypt.compare(password, staff.password);
    if (!isValid) {
      return NextResponse.json({ error: "Email ya password galat hai!" }, { status: 401 });
    }

    // Token banao
    const token = jwt.sign(
      {
        staffId: staff.id,
        hotelId: staff.hotelId,
        role: "STAFF",
        name: staff.name,
        employeeId: staff.employeeId,
      },
      process.env.JWT_SECRET || "hotelpro-secret-key",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login successful!",
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        employeeId: staff.employeeId,
        role: staff.role,
        hotelName: staff.hotel.name,
        hotelId: staff.hotelId,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}