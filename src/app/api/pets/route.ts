import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { petSchema } from "@/lib/validations"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ pets })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const data = petSchema.parse(body)
    const pet = await prisma.pet.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        age: data.age || null,
        weight: data.weight || null,
        notes: data.notes || null,
        ownerId: user.id,
      },
    })
    return NextResponse.json({ pet }, { status: 201 })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
