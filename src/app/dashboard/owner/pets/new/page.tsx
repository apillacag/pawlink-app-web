"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function NewPetPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    species: "DOG",
    breed: "",
    age: "",
    weight: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t("common.failedToCreate"))
      } else {
        router.push("/dashboard/owner/pets")
      }
    } catch {
      setError(t("common.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("pets.addNewPet")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}
            <Input
              id="name"
              label={t("pets.petName")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("pets.species")}</label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="DOG">{t("pets.dog")}</option>
                <option value="CAT">{t("pets.cat")}</option>
                <option value="OTHER">{t("pets.other")}</option>
              </select>
            </div>
            <Input
              id="breed"
              label={t("pets.breedOptional")}
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="age"
                label={t("pets.ageYears")}
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <Input
                id="weight"
                label={t("pets.weightKg")}
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("pets.notes")}</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder={t("pets.notesPlaceholder")}
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {t("pets.addPet")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
