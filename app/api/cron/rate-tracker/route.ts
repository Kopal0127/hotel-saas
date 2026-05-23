import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Sirf un hotels ko fetch karo jinke paas serpApiKey hai
  const hotels = await prisma.hotel.findMany({
    where: { serpApiKey: { not: null } },
    include: { competitors: true },
  });

  const allResults = [];

  for (const hotel of hotels) {
    if (!hotel.serpApiKey || hotel.competitors.length === 0) continue;

    for (const competitor of hotel.competitors) {
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

        allResults.push({ hotelId: hotel.id, competitorId: competitor.id, price, source });
      } catch (err) {
        console.error(`Cron error for ${competitor.name}:`, err);
        allResults.push({ hotelId: hotel.id, competitorId: competitor.id, error: "fetch failed" });
      }
    }
  }

  return NextResponse.json({ success: true, processed: allResults.length, results: allResults });
}
