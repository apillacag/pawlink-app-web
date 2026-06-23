import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const specialists = await prisma.user.findMany({
    where: {
      role: "SPECIALIST",
      specialistProfile: { isAvailable: true },
    },
    include: {
      specialistProfile: true,
    },
  })
  return NextResponse.json({ specialists })
}
