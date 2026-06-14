import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const hotel = await prisma.hotel.findFirst()
    if (!hotel) return NextResponse.json({ provider: null })

    const provider = await prisma.connectivityProvider.findUnique({
      where: { hotelId: hotel.id }
    })

    return NextResponse.json({ provider })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const hotel = await prisma.hotel.findFirst()
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const { apiKey, apiSecret, accountId } = await req.json()

    const provider = await prisma.connectivityProvider.upsert({
      where: { hotelId: hotel.id },
      update: { apiKey, apiSecret, accountId, isConnected: true, connectedAt: new Date() },
      create: { hotelId: hotel.id, apiKey, apiSecret, accountId, isConnected: true, connectedAt: new Date() }
    })

    return NextResponse.json({ provider })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}