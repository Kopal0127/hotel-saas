import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — Fetch booking engine settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    if (!hotelId) {
      return NextResponse.json({ error: "hotelId chahiye!" }, { status: 400 });
    }

    let engine = await prisma.bookingEngine.findUnique({
      where: { hotelId },
    });

    // Agar exist nahi karta toh create karo
    if (!engine) {
      engine = await prisma.bookingEngine.create({
        data: { hotelId },
      });
    }

    return NextResponse.json({ engine });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

// PUT — Update booking engine settings
export async function PUT(req: NextRequest) {
  try {
   const {
      hotelId,
      description,
      amenities,
      nearestAttractions,
      bannerImage,
      galleryImages,
      isActive,
      allowExtraMattress,
    } = await req.json();

    if (!hotelId) {
      return NextResponse.json({ error: "hotelId chahiye!" }, { status: 400 });
    }

    const engine = await prisma.bookingEngine.upsert({
      where: { hotelId },
     update: {
        description: description ?? undefined,
        amenities: amenities ?? undefined,
        nearestAttractions: nearestAttractions ?? undefined,
        bannerImage: bannerImage ?? undefined,
        galleryImages: galleryImages ?? undefined,
        isActive: isActive ?? undefined,
        allowExtraMattress: allowExtraMattress ?? undefined,
      },
      create: {
        hotelId,
        description,
        amenities: amenities || [],
        nearestAttractions: nearestAttractions || null,
        bannerImage: bannerImage || null,
        galleryImages: galleryImages || [],
        isActive: isActive ?? true,
        allowExtraMattress: allowExtraMattress ?? false,
      },
    });

    return NextResponse.json({ message: "Update ho gaya!", engine });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update nahi ho saka!" }, { status: 500 });
  }
}