"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle, XCircle, QrCode, Timer } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { useI18n } from "@/i18n/context"
import { formatCurrency } from "@/lib/utils"

interface BookingData {
  id: string
  totalAmount: number
  serviceType: string
  status: string
  pet: { name: string }
  walker: { name: string }
}

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingId, setBookingId] = useState("")
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [method, setMethod] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(300)

  const stripeSuccess = searchParams.get("success")
  const stripeCanceled = searchParams.get("canceled")

  useEffect(() => {
    const init = async () => {
      const p = await params
      setBookingId(p.bookingId)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!bookingId) return
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.booking) {
          setBooking(d.booking)
        }
      })
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setWalletBalance(d.user.walletBalance || 0)
      })
  }, [bookingId])

  useEffect(() => {
    if (stripeSuccess === "true" && bookingId) {
      setStatus("success")
      const timer = setTimeout(() => router.push("/dashboard/owner/bookings"), 3000)
      return () => clearTimeout(timer)
    }
  }, [stripeSuccess, bookingId, router])

  useEffect(() => {
    if (!method || status !== "processing") return
    if (method === "yape" || method === "plin") {
      if (countdown <= 0) return
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [method, status, countdown])

  const handleCardPayment = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("common.somethingWentWrong"))
        return
      }
      window.location.href = data.url
    } catch {
      setError(t("common.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  const handleYapePlinPayment = async (methodType: string) => {
    setMethod(methodType)
    setStatus("processing")
    setCountdown(300)
  }

  const confirmYapePlin = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payments/yape-plin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, method }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("common.somethingWentWrong"))
        setStatus("failed")
        return
      }
      setStatus("success")
      setMethod(null)
      setTimeout(() => router.push("/dashboard/owner/bookings"), 3000)
    } catch {
      setError(t("common.somethingWentWrong"))
      setStatus("failed")
    } finally {
      setLoading(false)
    }
  }

  const handleWalletPayment = async () => {
    if (!booking || (walletBalance < booking.totalAmount)) {
      setError(t("payments.insufficientBalance"))
      return
    }
    setLoading(true)
    setError("")
    setMethod("wallet")
    setStatus("processing")
    try {
      const res = await fetch("/api/payments/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("common.somethingWentWrong"))
        setStatus("failed")
        return
      }
      setWalletBalance((prev) => prev - (booking?.totalAmount || 0))
      setStatus("success")
      setTimeout(() => router.push("/dashboard/owner/bookings"), 3000)
    } catch {
      setError(t("common.somethingWentWrong"))
      setStatus("failed")
    } finally {
      setLoading(false)
    }
  }

  if (booking && booking.status !== "PENDING_PAYMENT" && status === "idle") {
    const statusMsg = booking.status === "COMPLETED" ? t("bookings.bookingCompletedStatus") :
      booking.status === "CANCELLED" ? t("bookings.bookingCancelledStatus") :
      booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS" ? t("bookings.bookingAlreadyPaid") :
      t("bookings.bookingNotAvailable")
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
          <XCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusMsg}</h2>
        <p className="text-gray-500 mb-8">{t("bookings.bookingNotAvailable")}</p>
        <Link href="/dashboard/owner/bookings">
          <Button>{t("common.back")}</Button>
        </Link>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("payments.success")}</h2>
        <p className="text-gray-500 mb-8">{t("payments.successDesc")}</p>
        <div className="animate-pulse h-1.5 w-48 mx-auto rounded-full bg-emerald-200" />
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("payments.failed")}</h2>
        <p className="text-gray-500 mb-2">{t("payments.failedDesc")}</p>
        {error && <p className="text-sm text-red-600 mb-8">{error}</p>}
        <Button onClick={() => { setStatus("idle"); setMethod(null); setError("") }}>
          {t("common.back")}
        </Button>
      </div>
    )
  }

  if (method === "yape" || method === "plin") {
    const mins = Math.floor(countdown / 60)
    const secs = countdown % 60
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Link href="/dashboard/owner/bookings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
        <Card>
          <CardContent className="p-6 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("payments.scanQR")} {method?.toUpperCase()}
            </h2>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mx-auto max-w-[200px]">
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Timer className="h-4 w-4" />
              <span>{mins}:{secs.toString().padStart(2, "0")}</span>
            </div>
            <Button className="w-full" onClick={confirmYapePlin} loading={loading}>
              {t("payments.manualConfirm")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "processing" && method === "wallet") {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
          <Wallet className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("payments.processing")}</h2>
        <div className="animate-pulse h-1.5 w-48 mx-auto rounded-full bg-emerald-200" />
      </div>
    )
  }

  if (stripeCanceled === "true") {
    setStatus("idle")
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link href="/dashboard/owner/bookings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("payments.selectMethod")}</h2>

          {booking && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("payments.total")}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("bookings.service")}</span>
                <span className="text-gray-700">{booking.serviceType === "CONSULTATION" ? t("bookings.serviceConsultation") : t("bookings.serviceWalking")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("bookings.petLabel")}</span>
                <span className="text-gray-700">{booking.pet?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("bookings.walker")}</span>
                <span className="text-gray-700">{booking.walker?.name}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCardPayment}
              disabled={loading}
              className="w-full flex items-center gap-4 rounded-lg border border-gray-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t("payments.card")}</p>
                <p className="text-sm text-gray-500">{t("payments.cardDesc")}</p>
              </div>
            </button>

            <button
              onClick={() => handleYapePlinPayment("yape")}
              disabled={loading}
              className="w-full flex items-center gap-4 rounded-lg border border-gray-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <Smartphone className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t("payments.yape")}</p>
                <p className="text-sm text-gray-500">{t("payments.yapeDesc")}</p>
              </div>
            </button>

            <button
              onClick={() => handleYapePlinPayment("plin")}
              disabled={loading}
              className="w-full flex items-center gap-4 rounded-lg border border-gray-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t("payments.plin")}</p>
                <p className="text-sm text-gray-500">{t("payments.plinDesc")}</p>
              </div>
            </button>

            <button
              onClick={handleWalletPayment}
              disabled={loading || (booking ? walletBalance < booking.totalAmount : false)}
              className="w-full flex items-center gap-4 rounded-lg border border-gray-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t("payments.wallet")}</p>
                <p className="text-sm text-gray-500">{t("payments.walletDesc")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(walletBalance)}</p>
                <p className="text-xs text-gray-500">{t("payments.balance")}</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
