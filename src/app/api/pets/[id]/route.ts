import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const pet = await prisma.pet.findUnique({ where: { id } })
  if (!pet || pet.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ pet })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const pet = await prisma.pet.findUnique({ where: { id } })
  if (!pet || pet.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  await prisma.pet.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
