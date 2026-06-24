"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface WalkActionsProps {
  bookingId: string
  status: string
  type?: "walk" | "consultation"
}

export function WalkActions({ bookingId, status, type = "walk" }: WalkActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <Button size="sm" onClick={() => updateStatus("CONFIRMED")} loading={loading === "CONFIRMED"}>
          Confirm
        </Button>
      )}
      {status === "CONFIRMED" && (
        <Button size="sm" onClick={() => updateStatus("IN_PROGRESS")} loading={loading === "IN_PROGRESS"}>
          {type === "consultation" ? "Start Session" : "Start Walk"}
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button size="sm" onClick={() => updateStatus("COMPLETED")} loading={loading === "COMPLETED"}>
          {type === "consultation" ? "Complete Session" : "Complete Walk"}
        </Button>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <Button size="sm" variant="ghost" onClick={() => updateStatus("CANCELLED")} loading={loading === "CANCELLED"}>
          Cancel
        </Button>
      )}
    </div>
  )
}
