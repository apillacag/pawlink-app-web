import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  const where: any = {
    role: "WALKER",
    walkerProfile: { isAvailable: true },
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
