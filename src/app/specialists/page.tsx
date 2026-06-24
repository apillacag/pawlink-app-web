import { getServerTranslations } from "@/i18n/server"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/Card"
import { Star, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default async function SpecialistsPage() {
  const { t } = await getServerTranslations()

  const specialists = await prisma.user.findMany({
    where: {
      role: "SPECIALIST",
      specialistProfile: { isAvailable: true },
    },
    include: {
      specialistProfile: true,
    },
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("specialists.publicTitle")}</h1>
          <p className="mt-2 text-lg text-gray-600">{t("specialists.publicDesc")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {specialists.length === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("specialists.noSpecialistsPublic")}</h3>
              <p className="text-gray-500">{t("specialists.checkBack")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialists.map((specialist) => {
              const profile = specialist.specialistProfile
              return (
                <Card key={specialist.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-xl font-medium text-purple-700">
                        {specialist.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{specialist.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-gray-700">{profile?.rating.toFixed(1) || "0.0"}</span>
                          <span className="text-gray-400">({profile?.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    {profile?.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        S/{profile?.ratePerSession.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t("walkers.perSession")}</span>
                      </span>
                      <Link href="/register">
                        <Button size="sm">{t("specialists.bookConsultation")}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
