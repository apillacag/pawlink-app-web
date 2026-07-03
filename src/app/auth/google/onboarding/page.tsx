"use client"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PawPrint, Dog, User, Stethoscope, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useI18n } from "@/i18n/context"

function OnboardingForm() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const name = searchParams.get("name") || ""
  const avatar = searchParams.get("avatar") || ""

  const [step, setStep] = useState<"role" | "info">("role")
  const [role, setRole] = useState<"OWNER" | "WALKER" | "SPECIALIST" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    phone: "",
    bio: "",
    district: "",
    ratePerWalk: "15",
    ratePerSession: "50",
    specialties: "BEHAVIOR" as string,
  })

  const roles = [
    {
      value: "OWNER" as const,
      icon: User,
      label: t("auth.petOwner"),
      desc: t("auth.petOwnerDesc"),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      value: "WALKER" as const,
      icon: Dog,
      label: t("auth.dogWalker"),
      desc: t("auth.dogWalkerDesc"),
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      value: "SPECIALIST" as const,
      icon: Stethoscope,
      label: t("auth.specialist"),
      desc: t("auth.specialistDesc"),
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ]

  const handleSubmit = async () => {
    if (!role) return
    setLoading(true)
    setError("")

    try {
      const body: Record<string, unknown> = {
        email,
        name,
        avatarUrl: avatar || undefined,
        role,
        phone: form.phone || undefined,
        bio: (role === "WALKER" || role === "SPECIALIST") ? form.bio || undefined : undefined,
        district: form.district || undefined,
      }

      if (role === "WALKER") {
        body.ratePerWalk = parseFloat(form.ratePerWalk)
      } else if (role === "SPECIALIST") {
        body.ratePerSession = parseFloat(form.ratePerSession)
        body.specialties = form.specialties
      }

      const res = await fetch("/api/auth/google/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        window.location.href = "/dashboard"
      } else {
        const data = await res.json()
        setError(data.error || t("common.somethingWentWrong"))
      }
    } catch {
      setError(t("common.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  if (step === "role") {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
            <PawPrint className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.createAccount")}</h1>
          <p className="text-gray-500 mt-1">{t("auth.iAmA")}</p>
          {email && <p className="text-xs text-gray-400 mt-2">{email}</p>}
        </div>

        <div className="space-y-3">
          {roles.map((r) => {
            const selected = role === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? `${r.border} ${r.bg} shadow-sm`
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full ${r.bg} flex items-center justify-center`}>
                    <r.icon className={`h-6 w-6 ${r.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{r.label}</span>
                      {selected && <CheckCircle className={`h-4 w-4 ${r.color}`} />}
                    </div>
                    <p className="text-sm text-gray-500">{r.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!role}
          onClick={() => setStep("info")}
        >
          {t("common.next")} <ArrowRight className="h-4 w-4 ml-1" />
        </Button>

        <p className="text-center text-sm text-gray-500">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">{t("auth.signIn")}</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
          <PawPrint className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("auth.completeProfile")}</h1>
        <p className="text-gray-500 mt-1">
          {role === "OWNER" ? t("auth.almostDone") :
           role === "WALKER" ? t("auth.tellUsWalker") :
           t("auth.tellUsSpecialist")}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        <Input
          id="phone"
          label={t("auth.phone")}
          type="tel"
          placeholder={t("auth.phonePlaceholder")}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        {(role === "WALKER" || role === "SPECIALIST") && (
          <>
            <Input
              id="district"
              label={t("auth.district")}
              placeholder={t("auth.districtPlaceholder")}
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("auth.bio")}</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder={t("auth.bioPlaceholder")}
              />
            </div>
          </>
        )}

        {role === "WALKER" && (
          <Input
            id="rate"
            label={t("auth.ratePerWalk")}
            type="number"
            step="0.50"
            value={form.ratePerWalk}
            onChange={(e) => setForm({ ...form, ratePerWalk: e.target.value })}
          />
        )}

        {role === "SPECIALIST" && (
          <>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("auth.specialty")}</label>
              <select
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="BEHAVIOR">{t("auth.specialtyBehavior")}</option>
                <option value="TRAINING">{t("auth.specialtyTraining")}</option>
                <option value="NUTRITION">{t("auth.specialtyNutrition")}</option>
                <option value="ANXIETY">{t("auth.specialtyAnxiety")}</option>
              </select>
            </div>

            <Input
              id="rate"
              label={t("auth.ratePerSession")}
              type="number"
              step="5"
              value={form.ratePerSession}
              onChange={(e) => setForm({ ...form, ratePerSession: e.target.value })}
            />
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setStep("role")}>
          {t("common.back")}
        </Button>
        <Button className="flex-1" loading={loading} onClick={handleSubmit}>
          {t("auth.createAccountBtn")}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">{t("auth.signIn")}</Link>
      </p>
    </div>
  )
}

export default function GoogleOnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          </div>
        }>
          <OnboardingForm />
        </Suspense>
      </div>
    </div>
  )
}
