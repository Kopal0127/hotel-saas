import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const roomType = searchParams.get("roomType");

    if (!hotelId || !roomType) {
      return NextResponse.json({ content: null });
    }

    const content = await prisma.roomTypeContent.findUnique({
      where: { hotelId_roomType: { hotelId, roomType } }
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelId, roomType, description, amenities, nearestAttractions, galleryImages, cancellationPolicies } = body;

    if (!hotelId || !roomType) {
      return NextResponse.json({ error: "hotelId aur roomType chahiye!" }, { status: 400 });
    }

    const content = await prisma.roomTypeContent.upsert({
      where: { hotelId_roomType: { hotelId, roomType } },
      update: {
        description: description || null,
        amenities: amenities || [],
        nearestAttractions: nearestAttractions || [],
        galleryImages: galleryImages || [],
        cancellationPolicies: cancellationPolicies || [],
      },
      create: {
        hotelId,
        roomType,
        description: description || null,
        amenities: amenities || [],
        nearestAttractions: nearestAttractions || [],
        galleryImages: galleryImages || [],
        cancellationPolicies: cancellationPolicies || [],
      }
    });

    return NextResponse.json({ content, message: "Save ho gaya!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Save nahi ho saka!" }, { status: 500 });
  }
}