import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const profile = await prisma.walkerProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: body.bio ?? undefined,
        experience: body.experience ?? undefined,
        certifications: body.certifications ?? undefined,
        ratePerWalk: body.ratePerWalk ?? undefined,
      },
      create: {
        userId: user.id,
        bio: body.bio,
        experience: body.experience,
        certifications: body.certifications,
        ratePerWalk: body.ratePerWalk || 15,
      },
    })
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const profile = await prisma.walkerProfile.findUnique({
    where: { userId: user.id },
  })
  return NextResponse.json({ profile })
}
