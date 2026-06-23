"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { I18nProvider } from "@/i18n/context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>PawLink - Connecting Caring Owners with Trusted Pet Professionals</title>
        <meta name="description" content="Safe walks, happy pets, peace of mind. Find trusted dog walkers and animal behavior specialists near you." />
        <meta name="keywords" content="pet care, dog walking, pet wellness, animal behavior, pet services" />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
