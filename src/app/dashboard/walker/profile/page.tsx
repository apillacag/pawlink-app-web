"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function WalkerProfilePage() {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm] = useState({
    bio: "",
    experience: "",
    certifications: "",
    ratePerWalk: "15",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/walkers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experience: form.experience ? parseInt(form.experience) : undefined,
          ratePerWalk: parseFloat(form.ratePerWalk),
        }),
      })
      if (res.ok) {
        setMessage(t("walker.profileUpdated"))
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(data.error || t("walker.profileUpdateFailed"))
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
          <CardTitle>{t("walker.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`rounded-lg border p-3 text-sm ${
                message.includes("successfully")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {message}
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("walker.bio")}</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder={t("walker.bioPlaceholder")}
              />
            </div>
            <Input
              id="experience"
              label={t("walker.yearsExperience")}
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
            <Input
              id="certifications"
              label={t("walker.certifications")}
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              placeholder={t("walker.certificationsPlaceholder")}
            />
            <Input
              id="rate"
              label={t("walker.ratePerWalk")}
              type="number"
              step="0.50"
              value={form.ratePerWalk}
              onChange={(e) => setForm({ ...form, ratePerWalk: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              {t("walker.saveProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
