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
    if (booking.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Booking is not pending payment" }, { status: 400 })
    }
    if (!booking.totalAmount) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 })
    }

    const [payment] = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({ where: { id: user.id } })
      if (!currentUser || (currentUser.walletBalance || 0) < booking.totalAmount!) {
        throw new Error("Insufficient wallet balance")
      }

      const newBalance = (currentUser.walletBalance || 0) - booking.totalAmount!

      const payment = await tx.payment.upsert({
        where: { bookingId: booking.id },
        update: { method: "wallet", status: "COMPLETED" },
        create: {
          bookingId: booking.id,
          userId: user.id,
          amount: booking.totalAmount!,
          currency: "PEN",
          method: "wallet",
          status: "COMPLETED",
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: booking.totalAmount! } },
      })

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "PAYMENT",
          amount: -booking.totalAmount!,
          description: `Payment for booking ${booking.id}`,
          reference: booking.id,
          balance: newBalance,
        },
      })

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      })

      return [payment]
    })

    return NextResponse.json({ payment })
  } catch (error: any) {
    console.error("Wallet payment error:", error)
    return NextResponse.json({ error: error.message || "Payment processing error" }, { status: 500 })
  }
}
