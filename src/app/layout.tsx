import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "./providers"
import { getCurrentUser } from "@/lib/auth"
import { getServerTranslations } from "@/i18n/server"
const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations()
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = await getServerTranslations()
  const user = await getCurrentUser()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar user={user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
