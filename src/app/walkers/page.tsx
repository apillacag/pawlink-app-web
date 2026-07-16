import { getServerTranslations } from "@/i18n/server"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/Card"
import { Star, Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { getWalkerProfileImage } from "@/lib/profileImages"
import Link from "next/link"

export default async function WalkersPage() {
  const { t, locale } = await getServerTranslations()

  const walkers = await prisma.user.findMany({
    where: {
      role: "WALKER",
      walkerProfile: { isAvailable: true },
    },
    include: {
      walkerProfile: true,
    },
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("walkers.publicTitle")}</h1>
          <p className="mt-2 text-lg text-gray-600">{t("walkers.publicDesc")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {walkers.length === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <img
                src="/images/empty-pets.jpg"
                alt="No walkers available"
                className="w-28 h-28 object-cover rounded-full mx-auto mb-4 shadow-sm"
                loading="lazy"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("walkers.noWalkersPublic")}</h3>
              <p className="text-gray-500">{t("walkers.checkBack")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {walkers.map((walker) => {
              const profile = walker.walkerProfile
              return (
                <Card key={walker.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={getWalkerProfileImage(walker.id, walker.name, walker.avatarUrl)}
                          alt={walker.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{walker.name}</h3>
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
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(profile?.ratePerWalk || 0, locale)} <span className="text-sm font-normal text-gray-500">{t("walkers.perWalk")}</span>
                      </span>
                      <Link href="/register">
                        <Button size="sm">{t("walkers.book")}</Button>
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
