import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { walkerProfile: true, specialistProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        walkerProfile: user.walkerProfile,
        specialistProfile: user.specialistProfile,
      },
      token,
    })

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
