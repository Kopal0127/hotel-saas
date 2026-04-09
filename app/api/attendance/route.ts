import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET || "hotelpro-secret-key") as { userId: string; staffId?: string };
  } catch { return null; }
}

// GET — Attendance fetch karo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const hotelId = searchParams.get("hotelId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const whereClause: any = {};

  if (staffId) whereClause.staffId = staffId;
  if (hotelId) whereClause.staff = { hotelId };
  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    whereClause.date = { gte: startDate, lte: endDate };
  }

  const attendance = await prisma.attendance.findMany({
    where: whereClause,
    include: { staff: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ attendance });
}

// POST — Check-in ya Check-out mark karo
export async function POST(req: NextRequest) {
  const { staffId, action } = await req.json();

  if (!staffId || !action) {
    return NextResponse.json({ error: "staffId aur action required hai!" }, { status: 400 });
  }

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const existing = await prisma.attendance.findFirst({
    where: { staffId, date: { gte: startOfDay, lte: endOfDay } }
  });

  if (action === "checkin") {
    if (existing) {
      return NextResponse.json({ error: "Aaj already check-in ho gaya hai!" }, { status: 400 });
    }
    const attendance = await prisma.attendance.create({
      data: { staffId, date: today, checkIn: today, status: "PRESENT" }
    });
    return NextResponse.json({ message: "Check-in ho gaya! ✅", attendance });
  }

  if (action === "checkout") {
    if (!existing) {
      return NextResponse.json({ error: "Pehle check-in karo!" }, { status: 400 });
    }
    if (existing.checkOut) {
      return NextResponse.json({ error: "Aaj already check-out ho gaya hai!" }, { status: 400 });
    }

    const checkInTime = new Date(existing.checkIn!);
    const checkOutTime = today;
    const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
        status: totalHours >= 4 ? "PRESENT" : "HALF_DAY"
      }
    });
    return NextResponse.json({ message: "Check-out ho gaya! ✅", attendance: updated });
  }

  return NextResponse.json({ error: "Invalid action!" }, { status: 400 });
}

// PUT — Manual attendance update (Admin)
export async function PUT(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { staffId, date, status, checkIn, checkOut } = await req.json();

  if (!staffId || !date) {
    return NextResponse.json({ error: "staffId aur date required!" }, { status: 400 });
  }

  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

  const existing = await prisma.attendance.findFirst({
    where: { staffId, date: { gte: startOfDay, lte: endOfDay } }
  });

  let totalHours = null;
  if (checkIn && checkOut) {
    totalHours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60);
    totalHours = Math.round(totalHours * 100) / 100;
  }

  if (existing) {
    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        status: status || existing.status,
        checkIn: checkIn ? new Date(checkIn) : existing.checkIn,
        checkOut: checkOut ? new Date(checkOut) : existing.checkOut,
        totalHours: totalHours || existing.totalHours,
      }
    });
    return NextResponse.json({ message: "Attendance update ho gayi!", attendance: updated });
  } else {
    const created = await prisma.attendance.create({
      data: {
        staffId, date: targetDate, status: status || "PRESENT",
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        totalHours,
      }
    });
    return NextResponse.json({ message: "Attendance add ho gayi!", attendance: created });
  }
}