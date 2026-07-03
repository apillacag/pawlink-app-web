import { NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/google"

export async function GET() {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const authUrl = getGoogleAuthUrl(origin)
  return NextResponse.redirect(authUrl)
}
