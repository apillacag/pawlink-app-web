import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role && { role: body.role }),
      ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
      ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
    },
  })

  const { passwordHash, ...safeUser } = updated
  return NextResponse.json({ user: safeUser })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
