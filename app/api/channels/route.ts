import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const hotel = await prisma.hotel.findFirst()
    if (!hotel) return NextResponse.json({ channels: [] })

    const channels = await prisma.otaChannel.findMany({
      where: { hotelId: hotel.id },
      include: { syncLogs: { orderBy: { createdAt: 'desc' }, take: 1 } }
    })

    return NextResponse.json({ channels })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const hotel = await prisma.hotel.findFirst()
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const { name, apiKey, apiSecret, propertyId } = await req.json()

    const channel = await prisma.otaChannel.upsert({
      where: { hotelId_name: { hotelId: hotel.id, name } },
      update: { apiKey, apiSecret, propertyId, isConnected: true },
      create: { hotelId: hotel.id, name, apiKey, apiSecret, propertyId, isConnected: true }
    })

    return NextResponse.json({ channel })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}