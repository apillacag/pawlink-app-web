import { cookies } from "next/headers"
import type { Locale } from "./config"
import { defaultLocale, locales } from "./config"
import type { Dictionary } from "./getDictionary"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default) as Promise<Dictionary>,
  es: () => import("./dictionaries/es.json").then((m) => m.default) as Promise<Dictionary>,
} as const

async function loadDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}

export async function getServerTranslations() {
  const cookieStore = await cookies()
  const localeRaw = cookieStore.get("pawlink_locale")?.value
  const locale: Locale =
    localeRaw && (locales as readonly string[]).includes(localeRaw)
      ? (localeRaw as Locale)
      : defaultLocale

  const dict = await loadDictionary(locale)

  function t(key: string): string {
    const keys = key.split(".")
    let value: any = dict
    for (const k of keys) {
      value = value?.[k]
    }
    return typeof value === "string" ? value : key
  }

  return { t, locale, dict }
}
