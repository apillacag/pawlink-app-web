import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const walks = await prisma.booking.findMany({
    where: { walkerId: user.id },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledAt: "desc" },
  })

  return NextResponse.json({ walks })
}
