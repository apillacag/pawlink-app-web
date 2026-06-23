import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where: any = {}
  if (user.role === "OWNER") where.ownerId = user.id
  else if (user.role === "WALKER") where.walkerId = user.id
  else if (user.role === "SPECIALIST") where.specialistId = user.id

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      pet: true,
      owner: { select: { name: true, phone: true } },
      walker: { select: { name: true } },
    },
    orderBy: { scheduledAt: "desc" },
  })

  return NextResponse.json({ bookings })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (!body.petId || !body.walkerId || !body.scheduledAt) {
      return NextResponse.json({ error: "Missing required fields: petId, walkerId, scheduledAt" }, { status: 400 })
    }

    const pet = await prisma.pet.findUnique({ where: { id: body.petId } })
    if (!pet || pet.ownerId !== user.id) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    const walker = await prisma.walkerProfile.findUnique({ where: { userId: body.walkerId } })
    const rate = walker?.ratePerWalk || 15
    const commission = rate * 0.15
    const totalAmount = rate + commission

    const booking = await prisma.booking.create({
      data: {
        ownerId: user.id,
        walkerId: body.walkerId,
        petId: body.petId,
        serviceType: body.serviceType || "WALKING",
        specialistId: body.specialistId || null,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration || 30,
        pickupLocation: body.pickupLocation || null,
        notes: body.notes || null,
        totalAmount,
        commission,
        status: "PENDING",
      },
      include: {
        pet: true,
        walker: { select: { name: true } },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
