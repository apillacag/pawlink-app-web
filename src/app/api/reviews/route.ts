import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { bookingId, rating, comment } = body

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    })
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    if (booking.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (booking.review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 })

    const review = await prisma.review.create({
      data: {
        bookingId,
        rating,
        comment: comment || null,
        reviewerId: user.id,
      },
    })

    const reviews = await prisma.review.findMany({
      where: { booking: { walkerId: booking.walkerId } },
    })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.walkerProfile.update({
      where: { userId: booking.walkerId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
