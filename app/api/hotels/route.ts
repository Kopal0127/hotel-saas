import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let result;
    if (userId) {
      result = await pool.query(
        `SELECT * FROM "Hotel" WHERE "userId" = $1`,
        [userId]
      );
    } else {
      result = await pool.query(`SELECT * FROM "Hotel"`);
    }

    return NextResponse.json({ hotels: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}