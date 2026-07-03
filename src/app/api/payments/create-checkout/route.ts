import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import stripe from "@/lib/stripe"

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pen",
            product_data: {
              name: `Booking #${booking.id.slice(0, 8)}`,
              description: `${booking.serviceType} - ${booking.duration} min`,
            },
            unit_amount: Math.round(booking.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/owner/payment/${booking.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/owner/payment/${booking.id}?canceled=true`,
    })

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { stripePaymentId: session.id },
      create: {
        bookingId: booking.id,
        userId: user.id,
        amount: booking.totalAmount,
        currency: "PEN",
        method: "credit_card",
        stripePaymentId: session.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
