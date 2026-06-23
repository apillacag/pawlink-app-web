import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [totalUsers, totalBookings, totalPets, totalWalkers, totalSpecialists, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.pet.count(),
    prisma.user.count({ where: { role: "WALKER" } }),
    prisma.user.count({ where: { role: "SPECIALIST" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalUsers,
      totalBookings,
      totalPets,
      totalWalkers,
      totalSpecialists,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
  })
}
