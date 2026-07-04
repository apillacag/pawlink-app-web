"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useI18n } from "@/i18n/context"
import { AlertTriangle } from "lucide-react"

interface WalkActionsProps {
  bookingId: string
  status: string
  type?: "walk" | "consultation"
}

export function WalkActions({ bookingId, status, type = "walk" }: WalkActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const { t } = useI18n()

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus)
    setError("")
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || t("common.somethingWentWrong"))
      }
    } catch {
      setError(t("common.somethingWentWrong"))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
      {status === "PENDING_PAYMENT" && (
        <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm text-amber-700">
          {t("bookings.pendingPayment")}
        </span>
      )}
      {status === "PENDING" && type === "consultation" && (
        <>
          <Button size="sm" onClick={() => updateStatus("CONFIRMED")} loading={loading === "CONFIRMED"}>
            {t("walkActions.acceptConsultation")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("CANCELLED")} loading={loading === "CANCELLED"}>
            {t("walkActions.rejectConsultation")}
          </Button>
        </>
      )}
      {status === "PENDING" && type !== "consultation" && (
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
      {(status === "PENDING" || status === "CONFIRMED") && (status !== "PENDING" || type !== "consultation") && (
        <Button size="sm" variant="ghost" onClick={() => updateStatus("CANCELLED")} loading={loading === "CANCELLED"}>
          {t("walkActions.cancel")}
        </Button>
      )}
    </div>
    </div>
  )
}
