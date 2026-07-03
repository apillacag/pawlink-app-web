"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function SpecialistProfilePage() {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm] = useState({
    bio: "",
    credentials: "",
    specialties: "BEHAVIOR",
    ratePerSession: "50",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/specialists/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ratePerSession: parseFloat(form.ratePerSession),
        }),
      })
      if (res.ok) {
        setMessage(t("specialistDash.profileUpdated"))
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(data.error || t("specialistDash.profileUpdateFailed"))
      }
    } catch {
      setMessage(t("common.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("specialistDash.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`rounded-lg border p-3 text-sm ${
                message === t("specialistDash.profileUpdated")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {message}
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("specialistDash.bio")}</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder={t("specialistDash.bioPlaceholder")}
              />
            </div>
            <Input
              id="credentials"
              label={t("specialistDash.credentials")}
              value={form.credentials}
              onChange={(e) => setForm({ ...form, credentials: e.target.value })}
              placeholder={t("specialistDash.credentialsPlaceholder")}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("specialistDash.specialty")}</label>
              <select
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="BEHAVIOR">{t("specialistDash.behavioral")}</option>
                <option value="TRAINING">{t("specialistDash.training")}</option>
                <option value="NUTRITION">{t("specialistDash.nutrition")}</option>
                <option value="ANXIETY">{t("specialistDash.anxiety")}</option>
              </select>
            </div>
            <Input
              id="rate"
              label={t("specialistDash.ratePerSession")}
              type="number"
              step="5"
              value={form.ratePerSession}
              onChange={(e) => setForm({ ...form, ratePerSession: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              {t("specialistDash.saveProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
