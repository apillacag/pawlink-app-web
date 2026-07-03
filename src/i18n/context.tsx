"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Locale } from "./config"
import { defaultLocale, locales } from "./config"
import type { Dictionary } from "./getDictionary"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale
  const saved = document.cookie
    .split("; ")
    .find((row) => row.startsWith("pawlink_locale="))
    ?.split("=")[1]
  if (saved && (locales as readonly string[]).includes(saved)) return saved as Locale
  const browserLang = navigator.language.slice(0, 2)
  if ((locales as readonly string[]).includes(browserLang)) return browserLang as Locale
  return defaultLocale
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dict: Dictionary | null
}

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string) => key,
  dict: null,
})

export function useI18n() {
  return useContext(I18nContext)
}

export function useT() {
  const { t } = useContext(I18nContext)
  return t
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale)
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromCookie = getInitialLocale()
    const effective = initialLocale ?? fromCookie
    setLocaleState(effective)
    import(`./dictionaries/${effective}.json`).then((m) => {
      setDict(m.default)
      setReady(true)
    })
  }, [initialLocale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    document.cookie = `pawlink_locale=${newLocale};path=/;max-age=31536000`
    import(`./dictionaries/${newLocale}.json`).then((m) => {
      setDict(m.default)
    })
  }, [])

  const t = useCallback(
    (key: string): string => {
      if (!dict) return key
      const keys = key.split(".")
      let value: any = dict
      for (const k of keys) {
        value = value?.[k]
      }
      return typeof value === "string" ? value : key
    },
    [dict]
  )

  if (!ready || !dict) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  )
}
