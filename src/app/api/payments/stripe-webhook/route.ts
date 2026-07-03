import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import stripe from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") || ""

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as any
      const bookingId = intent.metadata?.bookingId

      if (bookingId) {
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: intent.id },
        })

        if (payment && payment.status !== "COMPLETED") {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: "COMPLETED" },
            }),
            prisma.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            }),
          ])
        }
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: session.id },
        })

        if (payment && payment.status !== "COMPLETED") {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: "COMPLETED" },
            }),
            prisma.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            }),
          ])
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
