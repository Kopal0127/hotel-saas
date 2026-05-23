import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotelId } = body;
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel?.serpApiKey)
    return NextResponse.json({ error: "SerpAPI key not found" }, { status: 400 });

  const competitors = await prisma.competitor.findMany({ where: { hotelId } });
  if (competitors.length === 0)
    return NextResponse.json({ error: "No competitors found" }, { status: 400 });

  const results = [];

  for (const competitor of competitors) {
    try {
      const query = encodeURIComponent(`${competitor.name} ${competitor.location}`);
      const url = `https://serpapi.com/search.json?engine=google_hotels&q=${query}&api_key=${hotel.serpApiKey}&currency=INR`;

      const res = await fetch(url);
      const data = await res.json();

      let price = null;
      let source = null;
      let rating = null;
      let reviewCount = null;

      const properties = data?.properties || [];
      if (properties.length > 0) {
        const prop = properties[0];
        rating = prop?.overall_rating || null;
        reviewCount = prop?.reviews || null;

        const rateInfo = prop?.rate_per_night;
        if (rateInfo) {
          const lowest = rateInfo?.lowest;
          const beforeTax = rateInfo?.before_taxes_fees;
          const prices = [lowest, beforeTax]
            .map((p) => parseFloat(String(p || "0").replace(/[^0-9.]/g, "")))
            .filter((p) => p > 0);
          price = prices.length > 0 ? Math.max(...prices) : null;
        }

        const options = prop?.options || [];
        source = options.length > 0 ? options[0]?.source || "Google Hotels" : "Google Hotels";
      }

      await prisma.competitorRate.upsert({
        where: { competitorId: competitor.id },
        update: { price, source, rating, reviewCount, fetchedAt: new Date() },
        create: { competitorId: competitor.id, price, source, rating, reviewCount },
      });

      results.push({ competitorId: competitor.id, name: competitor.name, price, source, rating });
    } catch (err) {
      console.error(`Error fetching ${competitor.name}:`, err);
      results.push({ competitorId: competitor.id, name: competitor.name, error: "fetch failed" });
    }
  }

  return NextResponse.json({ success: true, results });
}
