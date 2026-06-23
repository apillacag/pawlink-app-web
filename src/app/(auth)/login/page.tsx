"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PawPrint } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useI18n } from "@/i18n/context"

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("auth.loginFailed"))
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError(t("auth.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <PawPrint className="h-10 w-10 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">PawLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.welcomeBack")}</h1>
          <p className="text-gray-500 mt-1">{t("auth.signInToAccount")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
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
            id="password"
            label={t("auth.password")}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            {t("auth.signIn")}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </div>
  )
}
