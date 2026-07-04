import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import getStripe from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") || ""

    let event
    try {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const handlePaymentSuccess = async (bookingId: string, stripePaymentId: string) => {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId },
      })

      if (payment && payment.status !== "COMPLETED") {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { serviceType: true },
        })

        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED" },
          }),
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: booking?.serviceType === "CONSULTATION" ? "PENDING" : "CONFIRMED" },
          }),
        ])
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as any
      const bookingId = intent.metadata?.bookingId
      if (bookingId) await handlePaymentSuccess(bookingId, intent.id)
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any
      const bookingId = session.metadata?.bookingId
      if (bookingId) await handlePaymentSuccess(bookingId, session.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
