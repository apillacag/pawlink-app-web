import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { isValidTransition, distributeEarnings, processRefund } from "@/lib/finance"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true } },
      walker: { select: { name: true, phone: true } },
      walkUpdates: { orderBy: { createdAt: "desc" } },
      review: true,
      payment: true,
    },
  })

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (booking.ownerId !== user.id && booking.walkerId !== user.id && booking.specialistId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ booking })
}

async function handleComplete(booking: any) {
  if (booking.status !== "IN_PROGRESS") {
    throw new Error("Booking must be IN_PROGRESS to complete")
  }

  const payment = booking.payment
  if (!payment || payment.status !== "COMPLETED") {
    throw new Error("Payment must be completed before completing booking")
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  const result = await distributeEarnings(booking.id)
  return result
}

async function handleCancel(booking: any, reason?: string) {
  const payment = booking.payment

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: reason || null,
    },
  })

  if (payment && payment.status === "COMPLETED") {
    await processRefund(booking.id)
  }

  return { cancelled: true, hadPayment: !!(payment && payment.status === "COMPLETED") }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    })
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const allowed = user.role === "ADMIN" || booking.ownerId === user.id || booking.walkerId === user.id
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    if (!body.status) return NextResponse.json({ error: "Status is required" }, { status: 400 })

    if (!isValidTransition(booking.status, body.status)) {
      return NextResponse.json({
        error: `Cannot transition from ${booking.status} to ${body.status}`,
      }, { status: 400 })
    }

    const updateData: Record<string, any> = { status: body.status }

    if (body.status === "IN_PROGRESS") {
      if (user.role !== "WALKER" && user.role !== "SPECIALIST" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the assigned professional can start" }, { status: 403 })
      }
      updateData.startedAt = new Date()
      await prisma.booking.update({ where: { id }, data: updateData })
      return NextResponse.json({ booking: { id, status: "IN_PROGRESS" } })
    }

    if (body.status === "COMPLETED") {
      if (user.role !== "WALKER" && user.role !== "SPECIALIST" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the assigned professional can complete a booking" }, { status: 403 })
      }
      const result = await handleComplete(booking)
      return NextResponse.json({
        booking: { id, status: "COMPLETED" },
        earnings: result.alreadyDistributed ? undefined : { professionalAmount: result.professionalAmount, platformAmount: result.platformAmount },
      })
    }

    if (body.status === "CANCELLED") {
      const result = await handleCancel(booking, body.reason)
      return NextResponse.json({ booking: { id, status: "CANCELLED" }, ...result })
    }

    if (body.status === "CONFIRMED") {
      await prisma.booking.update({ where: { id }, data: updateData })
      return NextResponse.json({ booking: { id, status: "CONFIRMED" } })
    }

    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
  } catch (error: any) {
    console.error("Booking update error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
