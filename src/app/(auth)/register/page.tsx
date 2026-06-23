"use client"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PawPrint } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useI18n } from "@/i18n/context"

function RegisterForm() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "OWNER"

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    phone: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("auth.registrationFailed"))
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError(t("auth.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: "OWNER", label: t("auth.petOwner"), desc: t("auth.petOwnerDesc") },
    { value: "WALKER", label: t("auth.dogWalker"), desc: t("auth.dogWalkerDesc") },
    { value: "SPECIALIST", label: t("auth.specialist"), desc: t("auth.specialistDesc") },
  ]

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <PawPrint className="h-10 w-10 text-emerald-600" />
          <span className="text-2xl font-bold text-gray-900">PawLink</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("auth.createAccount")}</h1>
        <p className="text-gray-500 mt-1">{t("auth.joinCommunity")}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t("auth.iAmA")}</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-lg border p-3 text-center transition-colors ${
                  form.role === r.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <div className="text-xs font-medium">{r.label}</div>
                <div className="text-[10px] mt-0.5 opacity-70">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Input
          id="name"
          label={t("auth.fullName")}
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          id="email"
          label={t("auth.email")}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          id="phone"
          label={t("auth.phone")}
          type="tel"
          placeholder="+1 555 000 0000"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          id="password"
          label={t("auth.password")}
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
        <Button type="submit" className="w-full" loading={loading}>
          {t("auth.createAccountBtn")}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
