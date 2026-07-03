import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { processTopUp } from "@/lib/finance"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const amount = parseFloat(body.amount)

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    if (amount > 10000) {
      return NextResponse.json({ error: "Maximum top-up amount is S/10,000" }, { status: 400 })
    }

    const result = await processTopUp(user.id, amount)

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      message: `Successfully added S/${amount.toFixed(2)} to your wallet`,
    })
  } catch (error: any) {
    console.error("Top-up error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
