import { prisma } from "@/lib/prisma"

const PLATFORM_COMMISSION_RATE = 0.20

export async function distributeEarnings(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  })
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "COMPLETED") throw new Error("Booking is not completed")
  if (booking.earningsDistributed) return { alreadyDistributed: true }

  const totalAmount = booking.totalAmount || 0
  const platformAmount = totalAmount * PLATFORM_COMMISSION_RATE
  const walkerAmount = totalAmount - platformAmount

  const walker = await prisma.user.findUnique({ where: { id: booking.walkerId } })
  if (!walker) throw new Error("Walker not found")

  const [result] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        userId: booking.walkerId,
        type: "EARNING",
        amount: walkerAmount,
        description: `Earnings for booking ${booking.id}`,
        reference: booking.id,
        balance: (walker.walletBalance || 0) + walkerAmount,
      },
    }),
    prisma.user.update({
      where: { id: booking.walkerId },
      data: { walletBalance: { increment: walkerAmount } },
    }),
    prisma.platformRevenue.upsert({
      where: { bookingId: booking.id },
      update: { amount: platformAmount },
      create: { bookingId: booking.id, amount: platformAmount },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { earningsDistributed: true },
    }),
    prisma.notification.create({
      data: {
        userId: booking.walkerId,
        type: "EARNING_RECEIVED",
        title: "Earnings Received",
        message: `You earned S/${walkerAmount.toFixed(2)} for booking #${booking.id.slice(0, 8)}`,
        link: "/dashboard/walker/earnings",
      },
    }),
  ])

  return { walkerAmount, platformAmount, alreadyDistributed: false }
}

export async function processRefund(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  })
  if (!booking) throw new Error("Booking not found")

  const payment = booking.payment
  if (!payment) return { refunded: false, reason: "No payment found" }
  if (payment.status === "REFUNDED") return { refunded: false, reason: "Already refunded" }

  const owner = await prisma.user.findUnique({ where: { id: booking.ownerId } })
  if (!owner) throw new Error("Owner not found")

  if (payment.method === "wallet") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      }),
      prisma.user.update({
        where: { id: booking.ownerId },
        data: { walletBalance: { increment: payment.amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: booking.ownerId,
          type: "REFUND",
          amount: payment.amount,
          description: `Refund for cancelled booking ${booking.id}`,
          reference: booking.id,
          balance: (owner.walletBalance || 0) + payment.amount,
        },
      }),
    ])
  } else if (payment.method === "credit_card") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    })
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    })
  }

  return { refunded: true, method: payment.method }
}

export async function processTopUp(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const [result] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        userId,
        type: "TOP_UP",
        amount,
        description: `Wallet top-up of S/${amount.toFixed(2)}`,
        balance: (user.walletBalance || 0) + amount,
      },
    }),
  ])

  return { newBalance: (user.walletBalance || 0) + amount }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
}

export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from]
  if (!allowed) return false
  return allowed.includes(to)
}
