"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import { useI18n } from "@/i18n/context"
import { formatCurrency } from "@/lib/utils"

interface Pet {
  id: string
  name: string
  species: string
}

interface Professional {
  id: string
  name: string
  rate: number
  bio?: string
}

export default function NewBookingPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const walkerId = searchParams.get("walkerId")
  const specialistId = searchParams.get("specialistId")
  const serviceType = searchParams.get("type") || "WALKING"
  const isConsultation = serviceType === "CONSULTATION"
  const proId = walkerId || specialistId || ""

  const [pets, setPets] = useState<Pet[]>([])
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [form, setForm] = useState({
    petId: "",
    proId: proId,
    scheduledAt: "",
    duration: isConsultation ? "60" : "30",
    notes: "",
    pickupLocation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/pets").then((r) => r.ok && r.json()).then((d) => setPets(d.pets || []))

    if (walkerId) {
      fetch(`/api/walkers?walkerId=${walkerId}`).then((r) => r.ok && r.json()).then((d) => {
        if (d.walkers?.length) {
          const w = d.walkers[0]
          setProfessional({
            id: w.id, name: w.name, rate: w.walkerProfile?.ratePerWalk || 15, bio: w.walkerProfile?.bio,
          })
        }
        setFetching(false)
      }).catch(() => setFetching(false))
    } else if (specialistId) {
      fetch(`/api/specialists?specialistId=${specialistId}`).then((r) => r.ok && r.json()).then((d) => {
        if (d.specialists?.length) {
          const s = d.specialists[0]
          setProfessional({
            id: s.id, name: s.name, rate: s.specialistProfile?.ratePerSession || 50, bio: s.specialistProfile?.bio,
          })
        }
        setFetching(false)
      }).catch(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [walkerId, specialistId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const body: Record<string, unknown> = {
        petId: form.petId,
        walkerId: walkerId || specialistId || "",
        specialistId: specialistId || undefined,
        serviceType,
        scheduledAt: form.scheduledAt,
        duration: parseInt(form.duration),
        notes: form.notes || undefined,
      }
      if (!isConsultation) {
        body.pickupLocation = form.pickupLocation || undefined
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("common.somethingWentWrong"))
      } else {
        window.location.href = `/dashboard/owner/payment/${data.booking.id}`
      }
    } catch {
      setError(t("common.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  const backLink = isConsultation ? "/dashboard/owner/specialists" : "/dashboard/owner/walkers"

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link href={backLink} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>

      <Card>
        <CardContent className="p-6">
          {fetching ? (
            <p className="text-gray-500 text-center py-8">{t("common.loading")}</p>
          ) : !professional ? (
            <p className="text-gray-500 text-center py-8">{t("common.noResults")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}

              <div className={`rounded-lg p-4 text-sm ${isConsultation ? "bg-purple-50 border border-purple-200" : "bg-emerald-50 border border-emerald-200"}`}>
                <p className="font-medium text-gray-900">{professional.name}</p>
                <p className={`font-medium ${isConsultation ? "text-purple-600" : "text-emerald-600"}`}>
                  {formatCurrency(professional.rate, locale)} {isConsultation ? t("walkers.perSession") : t("walkers.perWalk")}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{t("bookings.petLabel")}</label>
                <select
                  value={form.petId}
                  onChange={(e) => setForm({ ...form, petId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">{t("bookings.selectPet")}</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species.toLowerCase()})</option>
                  ))}
                </select>
              </div>

              <Input
                id="scheduledAt"
                label={t("bookings.dateTimeLabel")}
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                required
              />

              <Input
                id="duration"
                label={`${t("bookings.durationLabel")} (${t("bookings.minutes")})`}
                type="number"
                min="15"
                step="15"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />

              {!isConsultation && (
                <Input
                  id="pickupLocation"
                  label={t("bookings.pickupLocation")}
                  value={form.pickupLocation}
                  onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                />
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{t("bookings.notesLabel")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder={isConsultation ? t("bookings.notesPlaceholderConsultation") : t("bookings.notesPlaceholderWalk")}
                />
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                {isConsultation ? t("bookings.bookConsultationButton") : t("bookings.bookWalkButton")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
