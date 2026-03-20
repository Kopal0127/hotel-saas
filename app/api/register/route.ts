import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, hotelName } = await req.json();

    if (!name || !email || !password || !hotelName) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const existing = await pool.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Yeh email pehle se registered hai!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const hotelId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO "User" (id, name, email, password, role, "createdAt") VALUES ($1, $2, $3, $4, 'HOTEL_OWNER', NOW())`,
      [id, name, email, hashedPassword]
    );

    await pool.query(
      `INSERT INTO "Hotel" (id, name, "userId", "createdAt") VALUES ($1, $2, $3, NOW())`,
      [hotelId, hotelName, id]
    );

    return NextResponse.json(
      { message: "Account ban gaya! Ab login karo.", userId: id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}