import { getServerTranslations } from "@/i18n/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Star, Wallet, Award } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { getSpecialistProfileImage } from "@/lib/profileImages"

export default async function SpecialistsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("specialists.title")}</h2>
        <p className="text-gray-500">{t("specialists.desc")}</p>
      </div>

      {specialists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">{t("specialists.noSpecialists")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specialists.map((s) => {
            const profile = s.specialistProfile
            return (
              <Card key={s.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 overflow-hidden flex-shrink-0">
                      <img
                        src={getSpecialistProfileImage(s.id, s.name, s.avatarUrl)}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-gray-700">{profile?.rating.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {profile?.credentials && (
                      <p className="flex items-center gap-1"><Award className="h-4 w-4" /> {profile.credentials}</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium text-gray-900">{formatCurrency(profile?.ratePerSession || 0, locale)}</span>
                      <span>{t("walkers.perSession")}</span>
                    </p>
                  </div>

                  <Link href={`/dashboard/owner/bookings/new?specialistId=${s.id}&type=CONSULTATION`}>
                    <Button className="w-full">{t("specialists.bookConsultation")}</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
