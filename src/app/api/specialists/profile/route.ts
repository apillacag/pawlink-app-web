import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "SPECIALIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const profile = await prisma.specialistProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: body.bio ?? undefined,
        credentials: body.credentials ?? undefined,
        specialties: body.specialties ?? undefined,
        ratePerSession: body.ratePerSession ?? undefined,
      },
      create: {
        userId: user.id,
        bio: body.bio,
        credentials: body.credentials,
        specialties: body.specialties || "BEHAVIOR",
        ratePerSession: body.ratePerSession || 50,
      },
    })
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "SPECIALIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const profile = await prisma.specialistProfile.findUnique({
    where: { userId: user.id },
  })
  return NextResponse.json({ profile })
}
