import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getGoogleUserFromCode } from "@/lib/google"
import { generateToken } from "@/lib/jwt"

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error || !code) {
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin))
    }

    const googleUser = await getGoogleUserFromCode(code, origin)

    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (existingUser) {
      const token = generateToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      })

      const response = NextResponse.redirect(new URL("/dashboard", origin))
      response.cookies.set("pawlink_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })
      return response
    }

    const onboardingUrl = new URL("/auth/google/onboarding", origin)
    onboardingUrl.searchParams.set("email", googleUser.email)
    onboardingUrl.searchParams.set("name", googleUser.name)
    onboardingUrl.searchParams.set("avatar", googleUser.picture || "")
    return NextResponse.redirect(onboardingUrl)
  } catch {
    const origin2 = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin2))
  }
}
