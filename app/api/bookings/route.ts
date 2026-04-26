import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    const bookings = await prisma.booking.findMany({
      where: { room: { hotelId: hotelId || undefined } },
      include: {
        room: true,
        bookingRooms: { include: { room: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      roomId: b.roomId,
      roomNumber: b.room.number,
      roomType: b.room.type,
      price: b.room.price,
      rooms: b.bookingRooms.map(br => ({
        id: br.id,
        roomId: br.roomId,
        roomNumber: br.room.number,
        roomType: br.room.type,
        adults: br.adults,
        children: br.children,
        infants: br.infants,
        roomPrice: br.roomPrice,
        extraMattress: br.extraMattress,
        extraPillow: br.extraPillow,
        extraBedsheet: br.extraBedsheet,
        blanket: br.blanket,
      }))
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rooms, // Array of {roomId, adults, children, infants, extraMattress, extraPillow, extraBedsheet, blanket}
      roomId, // Primary room (first room)
      guestName, guestEmail, guestPhone, checkIn, checkOut, amount,
      notes, specialRequests, paymentMode, paymentAmount,
      finalPaymentMode, finalPaymentAmount, source
    } = body;

    // Agar rooms array aaya hai toh multi-room booking, nahi toh single room (backward compatible)
    let roomsList: any[] = [];

    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      roomsList = rooms;
    } else {
      // Backward compatible — single room
      roomsList = [{
        roomId: body.roomId,
        adults: body.adults,
        children: body.children,
        infants: body.infants,
        extraMattress: body.extraMattress || 0,
        extraPillow: body.extraPillow || 0,
        extraBedsheet: body.extraBedsheet || 0,
        blanket: body.blanket || 0,
      }];
    }

    const primaryRoomId = roomsList[0].roomId;

    if (!primaryRoomId || !guestName || !guestEmail || !checkIn || !checkOut || !amount) {
      return NextResponse.json({ error: "Sab fields bharo!" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // ✅ Validate har room
    for (const r of roomsList) {
      const roomData = await prisma.room.findUnique({ where: { id: r.roomId } });

      if (!roomData) {
        return NextResponse.json({ error: "Room nahi mila!" }, { status: 400 });
      }

      const adultsCount = parseInt(r.adults) || 1;
      const childrenCount = parseInt(r.children) || 0;
      const infantsCount = parseInt(r.infants) || 0;
      const maxAdults = roomData.maxAdults || 2;
      const maxChildren = roomData.maxChildren || 0;
      const maxInfants = roomData.maxInfants || 0;

      // ✅ Extra Mattress Logic
      const extraMattress = parseInt(r.extraMattress) || 0;
      const extraAdults = Math.max(0, adultsCount - maxAdults);
      const extraChildren = Math.max(0, childrenCount - maxChildren);
      const extraInfants = Math.max(0, infantsCount - maxInfants);
      const totalExtraPeople = extraAdults + extraChildren + extraInfants;

      if (totalExtraPeople > extraMattress) {
        return NextResponse.json({
          error: `Room #${roomData.number} mein max ${maxAdults} Adult/${maxChildren} Child/${maxInfants} Infant hai. Aapne ${totalExtraPeople} extra persons daale hain lekin sirf ${extraMattress} mattress add kiya! Extra Beds mein ${totalExtraPeople} mattress add karo.`
        }, { status: 400 });
      }

      // Room already booked check
      const existingBooking = await prisma.booking.findFirst({
        where: {
          OR: [
            { roomId: r.roomId },
            { bookingRooms: { some: { roomId: r.roomId } } }
          ],
          status: { in: ["CONFIRMED", "PENDING", "CHECKED_IN"] },
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ]
        }
      });

      if (existingBooking) {
        return NextResponse.json({
          error: `Room #${roomData.number} already ${new Date(existingBooking.checkIn).toLocaleDateString("en-IN")} se ${new Date(existingBooking.checkOut).toLocaleDateString("en-IN")} tak booked hai!`
        }, { status: 400 });
      }
    }

    // ✅ Booking create
    const firstRoom = roomsList[0];
    const booking = await prisma.booking.create({
      data: {
        roomId: primaryRoomId,
        guestName,
        guestEmail,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: "CONFIRMED",
        amount: parseFloat(amount),
        notes: notes || null,
        specialRequests: specialRequests || null,
        paymentMode: paymentMode || "CASH",
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        finalPaymentMode: finalPaymentMode || null,
        finalPaymentAmount: finalPaymentAmount ? parseFloat(finalPaymentAmount) : null,
        adults: parseInt(firstRoom.adults) || 1,
        children: parseInt(firstRoom.children) || 0,
        infants: parseInt(firstRoom.infants) || 0,
        source: source || "WALK_IN",
        guestPhone: guestPhone || null,
      },
      include: { room: { include: { hotel: true } } }
    });

    // ✅ BookingRooms create karo sab rooms ke liye
    await Promise.all(roomsList.map(async (r: any) => {
      const roomData = await prisma.room.findUnique({ where: { id: r.roomId } });
      await prisma.bookingRoom.create({
        data: {
          bookingId: booking.id,
          roomId: r.roomId,
          adults: parseInt(r.adults) || 1,
          children: parseInt(r.children) || 0,
          infants: parseInt(r.infants) || 0,
          roomPrice: roomData?.price || 0,
          extraMattress: parseInt(r.extraMattress) || 0,
          extraPillow: parseInt(r.extraPillow) || 0,
          extraBedsheet: parseInt(r.extraBedsheet) || 0,
          blanket: parseInt(r.blanket) || 0,
        }
      });
    }));

    // Available rooms update
    const datesToUpdate: Date[] = [];
    const cur = new Date(checkInDate);
    while (cur < checkOutDate) {
      datesToUpdate.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    for (const r of roomsList) {
      await Promise.all(datesToUpdate.map(async (date) => {
        const existing = await prisma.ratePlan.findFirst({
          where: {
            roomId: r.roomId,
            date: {
              gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
            }
          }
        });
        if (existing && existing.available > 0) {
          await prisma.ratePlan.update({
            where: { id: existing.id },
            data: { available: existing.available - 1 }
          });
        }
      }));
    }

    // Owner email
    resend.emails.send({
      from: "bookings@nightstays.in",
      to: "dargudetushar@gmail.com",
      subject: `Naya Booking — ${guestName} (${roomsList.length} room${roomsList.length > 1 ? "s" : ""})`,
      html: `
        <h2>Naya Booking Aaya!</h2>
        <p><b>Guest:</b> ${guestName}</p>
        <p><b>Email:</b> ${guestEmail}</p>
        <p><b>Phone:</b> ${guestPhone || "N/A"}</p>
        <p><b>Hotel:</b> ${booking.room.hotel.name}</p>
        <p><b>Rooms:</b> ${roomsList.length}</p>
        <p><b>Check In:</b> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
        <p><b>Check Out:</b> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
        <p><b>Total Amount:</b> ₹${amount}</p>
        <p><b>Payment Mode:</b> ${paymentMode || "CASH"}</p>
      `,
    }).catch(e => console.error("Email error:", e));

    // Guest email
    if (guestEmail) {
      resend.emails.send({
        from: "bookings@nightstays.in",
        to: guestEmail,
        subject: `Booking Confirmed — ${booking.room.hotel.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">🏨 Booking Confirmed!</h1>
            <p>Dear <b>${guestName}</b>,</p>
            <p>Your booking at <b>${booking.room.hotel.name}</b> has been confirmed!</p>
            <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Booking Details</h3>
              <p><b>Rooms Booked:</b> ${roomsList.length}</p>
              <p><b>Check-in:</b> ${new Date(checkIn).toLocaleDateString("en-IN")}</p>
              <p><b>Check-out:</b> ${new Date(checkOut).toLocaleDateString("en-IN")}</p>
              <p><b>Total Amount:</b> ₹${amount}</p>
              <p><b>Payment Mode:</b> ${paymentMode || "CASH"}</p>
            </div>
            <p style="color: #6b7280; text-align: center;">Thank you for choosing ${booking.room.hotel.name}!</p>
          </div>
        `,
      }).catch(e => console.error("Guest email error:", e));
    }

    return NextResponse.json({ message: "Booking ho gayi!", id: booking.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID chahiye!" }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { bookingRooms: true }
    });

    if (booking) {
      const datesToUpdate: Date[] = [];
      const cur = new Date(booking.checkIn);
      while (cur < booking.checkOut) {
        datesToUpdate.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }

      // Sab rooms ke liye availability +1
      const roomIds = booking.bookingRooms.length > 0
        ? booking.bookingRooms.map(br => br.roomId)
        : [booking.roomId];

      for (const rId of roomIds) {
        await Promise.all(datesToUpdate.map(async (date) => {
          const existing = await prisma.ratePlan.findFirst({
            where: {
              roomId: rId,
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
              }
            }
          });
          if (existing) {
            await prisma.ratePlan.update({
              where: { id: existing.id },
              data: { available: existing.available + 1 }
            });
          }
        }));
      }
    }

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking delete ho gayi!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat hua!" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID aur status chahiye!" }, { status: 400 });
    }

    const validStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "UPGRADED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status!" }, { status: 400 });
    }

   const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { room: true, bookingRooms: { include: { room: true } } },
    });

    // ✅ Auto Housekeeping Request — CHECKED_OUT hone pe
    if (status === "CHECKED_OUT") {
      const hotelId = booking.room.hotelId;
      
      // Sab rooms ke liye housekeeping request banao
      const roomsList = booking.bookingRooms.length > 0
        ? booking.bookingRooms.map((br: any) => ({
            roomId: br.roomId,
            roomNumber: br.room.number,
            roomType: br.room.type,
          }))
        : [{ roomId: booking.roomId, roomNumber: booking.room.number, roomType: booking.room.type }];

      await Promise.all(roomsList.map(async (r: any) => {
        // Duplicate check — same room ki request already exist nahi karni chahiye
        const existing = await prisma.housekeepingRequest.findFirst({
          where: {
            roomId: r.roomId,
            status: { in: ["PENDING", "IN_PROGRESS"] },
          }
        });

        if (!existing) {
         await prisma.housekeepingRequest.create({
            data: {
              hotelId,
              roomId: r.roomId,
              roomNumber: r.roomNumber,
              roomType: r.roomType || "Standard",
              requestType: "CLEANING",
              priority: "NORMAL",
              status: "PENDING",
              source: "CHECKOUT",
            }
          });
        }
      }));
    }

    return NextResponse.json({ message: "Status update ho gaya!", booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Status update nahi ho saka!" }, { status: 500 });
  }
}