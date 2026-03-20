import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const result = await pool.query(
      `SELECT b.*, r.number as "roomNumber", r.type as "roomType", r.price
       FROM "Booking" b
       JOIN "Room" r ON b."roomId" = r.id
       WHERE r."hotelId" = $1
       ORDER BY b."createdAt" DESC`,
      [hotelId]
    );

    return NextResponse.json({ bookings: result.rows });
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

    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO "Booking" (id, "roomId", "guestName", "guestEmail", "checkIn", "checkOut", status, amount, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED', $7, NOW())`,
      [id, roomId, guestName, guestEmail, checkIn, checkOut, parseFloat(amount)]
    );

    return NextResponse.json({ message: "Booking ho gayi!", id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}