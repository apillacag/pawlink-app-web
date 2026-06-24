import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || (user.role !== "WALKER" && user.role !== "SPECIALIST")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const isWalker = user.role === "WALKER"
  const isSpecialist = user.role === "SPECIALIST"
  if ((isWalker && booking.walkerId !== user.id) || (isSpecialist && booking.specialistId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const update = await prisma.walkUpdate.create({
    data: {
      bookingId: id,
      type: body.type || "LOCATION",
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      photoUrl: body.photoUrl || null,
      note: body.note || null,
    },
  })

  if (body.latitude && body.longitude) {
    await prisma.booking.update({
      where: { id },
      data: { latitude: body.latitude, longitude: body.longitude },
    })
  }

  return NextResponse.json({ update }, { status: 201 })
}
