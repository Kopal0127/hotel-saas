import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

async function pullBookingComBookings(channel: any) {
  return [
    {
      otaBookingRef: 'BDC-' + Date.now(),
      guestName: 'Test Guest (Booking.com)',
      guestEmail: 'guest@example.com',
      checkIn: new Date(Date.now() + 86400000),
      checkOut: new Date(Date.now() + 86400000 * 3),
      amount: 5997,
      commission: 599.7,
    }
  ]
}

async function pullMMTBookings(channel: any) {
  return [
    {
      otaBookingRef: 'MMT-' + Date.now(),
      guestName: 'Test Guest (MakeMyTrip)',
      guestEmail: 'guest2@example.com',
      checkIn: new Date(Date.now() + 86400000 * 2),
      checkOut: new Date(Date.now() + 86400000 * 4),
      amount: 3998,
      commission: 399.8,
    }
  ]
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = jwt.verify(token, process.env.JWT_SECRET!) as any

  const hotel = await prisma.hotel.findFirst({
    where: { userId: user.id },
    include: { channels: { where: { isConnected: true } } }
  })

  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

  let totalImported = 0

  for (const channel of hotel.channels) {
    let bookings: any[] = []

    if (channel.name === 'BOOKING_COM') bookings = await pullBookingComBookings(channel)
    else if (channel.name === 'MAKEMYTRIP') bookings = await pullMMTBookings(channel)

    for (const b of bookings) {
      const exists = await prisma.otaBooking.findFirst({
        where: { otaBookingRef: b.otaBookingRef }
      })
      if (exists) continue

      await prisma.otaBooking.create({
        data: {
          hotelId: hotel.id,
          otaName: channel.name,
          otaBookingRef: b.otaBookingRef,
          guestName: b.guestName,
          guestEmail: b.guestEmail,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          amount: b.amount,
          commission: b.commission,
          status: 'CONFIRMED'
        }
      })
      totalImported++
    }

    await prisma.syncLog.create({
      data: {
        channelId: channel.id,
        type: 'BOOKING_PULL',
        status: 'SUCCESS',
        message: `${bookings.length} bookings pulled`
      }
    })
  }

  return NextResponse.json({ message: `${totalImported} new bookings imported` })
}