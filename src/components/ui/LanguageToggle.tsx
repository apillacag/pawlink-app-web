"use client"

import { useI18n } from "@/i18n/context"
import { localeLabels, type Locale } from "@/i18n/config"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()

  const toggle = () => {
    const next: Locale = locale === "en" ? "es" : "en"
    setLocale(next)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
      title={locale === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span className="uppercase font-semibold">{localeLabels[locale]}</span>
    </button>
  )
}
