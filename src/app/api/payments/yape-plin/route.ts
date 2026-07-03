import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { generateId } from "@/lib/utils"

const SIMULATION_DELAY_MS = 3000

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { bookingId, method } = await req.json()
    if (!bookingId || !method) {
      return NextResponse.json({ error: "Missing bookingId or method" }, { status: 400 })
    }
    if (method !== "yape" && method !== "plin") {
      return NextResponse.json({ error: "Invalid method. Use 'yape' or 'plin'" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.ownerId !== user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (!booking.totalAmount) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 })
    }

    const reference = `${method.toUpperCase()}-${generateId().toUpperCase()}`

    await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAY_MS))

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        method,
        reference,
        status: "COMPLETED",
      },
      create: {
        bookingId: booking.id,
        userId: user.id,
        amount: booking.totalAmount,
        currency: "PEN",
        method,
        reference,
        status: "COMPLETED",
      },
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    })

    return NextResponse.json({ payment, reference })
  } catch (error) {
    console.error("yape/plin error:", error)
    return NextResponse.json({ error: "Payment processing error" }, { status: 500 })
  }
}
