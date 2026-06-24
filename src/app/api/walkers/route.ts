import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const walkerId = searchParams.get("walkerId")

  const where: any = {
    role: "WALKER",
    walkerProfile: { isAvailable: true },
  }
  if (walkerId) {
    where.id = walkerId
  }

  const walkers = await prisma.user.findMany({
    where,
    include: {
      walkerProfile: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ walkers })
}
