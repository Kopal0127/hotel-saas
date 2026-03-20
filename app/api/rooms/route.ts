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
      `SELECT * FROM "Room" WHERE "hotelId" = $1 ORDER BY "number"`,
      [hotelId]
    );

    return NextResponse.json({ rooms: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { number, type, price, hotelId } = await req.json();

    if (!number || !type || !price || !hotelId) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO "Room" (id, number, type, price, "hotelId") VALUES ($1, $2, $3, $4, $5)`,
      [id, number, type, parseFloat(price), hotelId]
    );

    return NextResponse.json({ message: "Room add ho gaya!", id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}