import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "./providers"
import { getCurrentUser } from "@/lib/auth"
const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = cookieStore.get("pawlink_locale")?.value || "en"
  if (locale === "es") {
    return {
      title: "PawLink - Conectamos Dueños con Profesionales de Confianza",
      description: "Paseos seguros, mascotas felices, tranquilidad. Encuentra paseadores de perros y especialistas en comportamiento animal cerca de ti.",
      keywords: "cuidado de mascotas, paseo de perros, bienestar animal, comportamiento animal, servicios para mascotas",
    }
  }
  return {
    title: "PawLink - Connecting Caring Owners with Trusted Pet Professionals",
    description: "Safe walks, happy pets, peace of mind. Find trusted dog walkers and animal behavior specialists near you.",
    keywords: "pet care, dog walking, pet wellness, animal behavior, pet services",
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  const locale = cookieStore.get("pawlink_locale")?.value || "en"

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
