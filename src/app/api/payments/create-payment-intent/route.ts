import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { createPaymentIntent } from "@/lib/stripe"

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

    const intent = await createPaymentIntent(booking.totalAmount, booking.id)

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { stripePaymentId: intent.id },
      create: {
        bookingId: booking.id,
        userId: user.id,
        amount: booking.totalAmount,
        currency: "PEN",
        method: "credit_card",
        stripePaymentId: intent.id,
      },
    })

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Stripe error:", error)
    return NextResponse.json({ error: "Payment processing error" }, { status: 500 })
  }
}
