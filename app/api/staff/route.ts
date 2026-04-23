import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET || "hotelpro-secret-key") as { userId: string };
  } catch { return null; }
}

async function generateEmployeeId(hotelId: string): Promise<string> {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  const prefix = (hotel?.name || "HO").slice(0, 2).toUpperCase();
  const count = await prisma.staff.count({ where: { hotelId } });
  const number = String(count + 1).padStart(3, "0");
  return `${prefix}${number}`;
}

// GET — Staff list
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const hotelId = searchParams.get("hotelId");
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });

  const staff = await prisma.staff.findMany({
    where: { hotelId },
    select: {
      id: true, employeeId: true, name: true, email: true,
      phone: true, role: true, roles: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ staff });
}

// POST — Naya staff add
export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, phone, hotelId, roles } = await req.json();

  if (!name || !email || !password || !hotelId) {
    return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
  }

  const existing = await prisma.staff.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered hai!" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);
  const employeeId = await generateEmployeeId(hotelId);

  const staff = await prisma.staff.create({
    data: {
      name, email, password: hashedPassword, phone, hotelId,
      role: "STAFF", employeeId,
      roles: Array.isArray(roles) ? roles : []
    }
  });

  return NextResponse.json({
    message: "Staff add ho gaya!",
    staff: { id: staff.id, name: staff.name, email: staff.email, employeeId: staff.employeeId }
  }, { status: 201 });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.staff.delete({ where: { id } });
  return NextResponse.json({ message: "Staff delete ho gaya!" });
}