"use client"
import { useI18n } from "@/i18n/context"
import { Card, CardContent } from "@/components/ui/Card"
import { Search, Stethoscope } from "lucide-react"

export default function SpecialistsPage() {
  const { t } = useI18n()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("specialists.publicTitle")}</h1>
          <p className="mt-2 text-lg text-gray-600">{t("specialists.publicDesc")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-16 text-center">
            <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("specialists.noSpecialistsPublic")}</h3>
            <p className="text-gray-500">{t("specialists.checkBack")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
