"use client"
import Link from "next/link"
import { PawPrint } from "lucide-react"
import { useI18n } from "@/i18n/context"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="h-7 w-7 text-emerald-600" />
              <span className="text-lg font-bold text-gray-900">PawLink</span>
            </Link>
            <p className="text-sm text-gray-500">
              {t("nav.tagline")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("nav.services")}</h3>
            <ul className="space-y-2">
              <li><Link href="/walkers" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.dogWalking")}</Link></li>
              <li><Link href="/specialists" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.behaviorConsultations")}</Link></li>
              <li><Link href="/register?role=WALKER" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.becomeWalker")}</Link></li>
              <li><Link href="/register?role=SPECIALIST" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.becomeSpecialist")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("nav.company")}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.aboutUs")}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.contact")}</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.termsOfService")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("nav.support")}</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.helpCenter")}</Link></li>
              <li><Link href="/safety" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.safetyTips")}</Link></li>
              <li><Link href="/trust" className="text-sm text-gray-500 hover:text-emerald-600">{t("nav.trustAndSafety")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} PawLink. {t("nav.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  )
}
