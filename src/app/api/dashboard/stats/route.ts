import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let stats: Record<string, any> = {}

  if (user.role === "OWNER") {
    stats.pets = await prisma.pet.count({ where: { ownerId: user.id } })
    stats.bookings = await prisma.booking.count({ where: { ownerId: user.id } })
    stats.upcoming = await prisma.booking.count({
      where: { ownerId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
    })
  } else if (user.role === "WALKER") {
    stats.totalWalks = await prisma.booking.count({ where: { walkerId: user.id } })
    stats.completedWalks = await prisma.booking.count({ where: { walkerId: user.id, status: "COMPLETED" } })
    const earnings = await prisma.payment.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _sum: { amount: true },
    })
    stats.earnings = earnings._sum.amount || 0
  } else if (user.role === "SPECIALIST") {
    stats.totalSessions = await prisma.booking.count({ where: { specialistId: user.id } })
    stats.completedSessions = await prisma.booking.count({ where: { specialistId: user.id, status: "COMPLETED" } })
  }

  return NextResponse.json({ stats })
}
