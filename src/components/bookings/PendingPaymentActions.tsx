"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { useI18n } from "@/i18n/context"

interface PendingPaymentActionsProps {
  bookingId: string
}

export function PendingPaymentActions({ bookingId }: PendingPaymentActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (res.ok) {
        setShowConfirm(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/dashboard/owner/payment/${bookingId}`}>
          <Button size="sm">{t("bookings.continuePayment")}</Button>
        </Link>
        <Button size="sm" variant="outline" onClick={() => setShowConfirm(true)}>
          {t("bookings.cancelBooking")}
        </Button>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title={t("bookings.cancelBooking")}>
        <p className="text-gray-600 mb-6">{t("bookings.confirmCancelBooking")}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            {t("common.back")}
          </Button>
          <Button onClick={handleCancel} loading={loading}>
            {t("bookings.cancelBooking")}
          </Button>
        </div>
      </Modal>
    </>
  )
}
