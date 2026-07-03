"use client"

import { I18nProvider } from "@/i18n/context"
import type { Locale } from "@/i18n/config"

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>
}
