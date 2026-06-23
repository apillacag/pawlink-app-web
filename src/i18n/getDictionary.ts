import type { Locale } from "./config"

export type Dictionary = typeof import("./dictionaries/en.json")

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
} as const

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
