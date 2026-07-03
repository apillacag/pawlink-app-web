"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useI18n } from "@/i18n/context"

interface WalkActionsProps {
  bookingId: string
  status: string
  type?: "walk" | "consultation"
}

export function WalkActions({ bookingId, status, type = "walk" }: WalkActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useI18n()

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
      {status === "PENDING_PAYMENT" && (
        <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm text-amber-700">
          {t("bookings.pendingPayment")}
        </span>
      )}
      {status === "PENDING" && (
        <Button size="sm" onClick={() => updateStatus("CONFIRMED")} loading={loading === "CONFIRMED"}>
          {t("walkActions.confirm")}
        </Button>
      )}
      {status === "CONFIRMED" && (
        <Button size="sm" onClick={() => updateStatus("IN_PROGRESS")} loading={loading === "IN_PROGRESS"}>
          {type === "consultation" ? t("walkActions.startSession") : t("walkActions.startWalk")}
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button size="sm" onClick={() => updateStatus("COMPLETED")} loading={loading === "COMPLETED"}>
          {type === "consultation" ? t("walkActions.completeSession") : t("walkActions.completeWalk")}
        </Button>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <Button size="sm" variant="ghost" onClick={() => updateStatus("CANCELLED")} loading={loading === "CANCELLED"}>
          {t("walkActions.cancel")}
        </Button>
      )}
    </div>
  )
}
