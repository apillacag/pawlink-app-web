import { getServerTranslations } from "@/i18n/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Star, MapPin, Wallet } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function WalkersPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("walkers.title")}</h2>
        <p className="text-gray-500">{t("walkers.desc")}</p>
      </div>

      {walkers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">{t("walkers.noWalkers")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {walkers.map((walker) => {
            const profile = walker.walkerProfile
            return (
              <Card key={walker.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 overflow-hidden flex-shrink-0">
                      <img
                        src={walker.avatarUrl || "/images/default-avatar.jpg"}
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

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {profile?.experience && <p>{t("walkers.experience")}: {profile.experience} {t("walkers.years")}</p>}
                    <div className="flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium text-gray-900">{formatCurrency(profile?.ratePerWalk || 0, locale)}</span>
                      <span>{t("walkers.perWalk")}</span>
                    </div>
                  </div>

                  <Link href={`/dashboard/owner/bookings/new?walkerId=${walker.id}`}>
                    <Button className="w-full">{t("walkers.book")}</Button>
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
