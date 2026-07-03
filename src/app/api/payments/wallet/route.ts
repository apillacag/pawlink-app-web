import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.ownerId !== user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (!booking.totalAmount) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 })
    }

    if ((user.walletBalance || 0) < booking.totalAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
    }

    const [payment] = await prisma.$transaction([
      prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          method: "wallet",
          status: "COMPLETED",
        },
        create: {
          bookingId: booking.id,
          userId: user.id,
          amount: booking.totalAmount,
          currency: "PEN",
          method: "wallet",
          status: "COMPLETED",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: booking.totalAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          type: "PAYMENT",
          amount: -booking.totalAmount,
          description: `Payment for booking ${booking.id}`,
          reference: booking.id,
          balance: (user.walletBalance || 0) - booking.totalAmount,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      }),
    ])

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Wallet payment error:", error)
    return NextResponse.json({ error: "Payment processing error" }, { status: 500 })
  }
}
