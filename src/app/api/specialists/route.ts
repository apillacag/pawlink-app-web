import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const specialistId = searchParams.get("specialistId")

  const where: any = {
    role: "SPECIALIST",
    specialistProfile: { isAvailable: true },
  }
  if (specialistId) {
    where.id = specialistId
  }

  const specialists = await prisma.user.findMany({
    where,
    include: {
      specialistProfile: true,
    },
  })
  return NextResponse.json({ specialists })
}
