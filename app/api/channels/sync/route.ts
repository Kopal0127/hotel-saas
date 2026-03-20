import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncToBookingCom(channel: any, ratePlans: any[]) {
  console.log(`[Booking.com] Syncing ${ratePlans.length} rate plans...`)
  return { success: true, message: 'Mock sync successful' }
}

async function syncToMakeMyTrip(channel: any, ratePlans: any[]) {
  console.log(`[MakeMyTrip] Syncing ${ratePlans.length} rate plans...`)
  return { success: true, message: 'Mock sync successful' }
}

async function syncToGoogleHotel(channel: any, ratePlans: any[]) {
  console.log(`[Google Hotel] Syncing ${ratePlans.length} rate plans...`)
  return { success: true, message: 'Mock sync successful' }
}

export async function POST(req: NextRequest) {
  try {
    const hotel = await prisma.hotel.findFirst({
      include: {
        channels: { where: { isConnected: true } },
        rooms: true
      }
    })

    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const { startDate, endDate } = await req.json()

    const ratePlans = await prisma.ratePlan.findMany({
      where: {
        room: { hotelId: hotel.id },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { room: true }
    })

    const results = []

    for (const channel of hotel.channels) {
      let result: any
      try {
        if (channel.name === 'BOOKING_COM') result = await syncToBookingCom(channel, ratePlans)
        else if (channel.name === 'MAKEMYTRIP') result = await syncToMakeMyTrip(channel, ratePlans)
        else if (channel.name === 'GOOGLE_HOTEL_CENTRE') result = await syncToGoogleHotel(channel, ratePlans)
        else result = { success: true, message: 'Mock sync successful' }

        await prisma.syncLog.create({
          data: { channelId: channel.id, type: 'AVAILABILITY', status: 'SUCCESS', message: result.message }
        })

        await prisma.otaChannel.update({
          where: { id: channel.id },
          data: { lastSyncAt: new Date() }
        })

        results.push({ channel: channel.name, ...result })
      } catch (error: any) {
        results.push({ channel: channel.name, success: false, message: error.message })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}