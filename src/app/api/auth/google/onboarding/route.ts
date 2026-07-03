import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/jwt"
import { googleOnboardingSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = googleOnboardingSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || null,
        role: data.role,
        provider: "GOOGLE",
        phone: data.phone || null,
      },
    })

    if (data.role === "WALKER") {
      await prisma.walkerProfile.create({
        data: {
          userId: user.id,
          bio: data.bio || null,
          ratePerWalk: data.ratePerWalk || 15,
          certifications: data.district || null,
        },
      })
    } else if (data.role === "SPECIALIST") {
      await prisma.specialistProfile.create({
        data: {
          userId: user.id,
          bio: data.bio || null,
          ratePerSession: data.ratePerSession || 50,
          specialties: data.specialties || "BEHAVIOR",
          credentials: data.district || null,
        },
      })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }, { status: 201 })

    response.cookies.set("pawlink_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
