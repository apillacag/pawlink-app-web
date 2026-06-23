import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const allowed = user.role === "ADMIN" || booking.ownerId === user.id || booking.walkerId === user.id
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updateData: any = {}
  if (body.status) updateData.status = body.status
  if (body.status === "IN_PROGRESS") updateData.startedAt = new Date()
  if (body.status === "COMPLETED") updateData.completedAt = new Date()
  if (body.status === "CANCELLED") {
    updateData.cancelledAt = new Date()
    updateData.cancellationReason = body.reason || null
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ booking: updated })
}
