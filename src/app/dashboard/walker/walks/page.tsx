import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CalendarDays, Dog, MapPin, ArrowRight } from "lucide-react"
import { WalkActions } from "@/components/walk/WalkActions"
import { translateStatus, formatDateTime } from "@/lib/utils"

export default async function WalkerWalksPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") redirect("/dashboard")

  const walks = await prisma.booking.findMany({
    where: { walkerId: user.id, status: { not: "PENDING_PAYMENT" } },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledAt: "desc" },
  })

  const statusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success" as const
      case "PENDING": return "warning" as const
      case "CONFIRMED": return "info" as const
      case "IN_PROGRESS": return "info" as const
      case "CANCELLED": return "danger" as const
      default: return "default" as const
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("walker.myWalks")}</h2>
        <p className="text-gray-500">{t("walker.manageWalks")}</p>
      </div>

      {walks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <img
              src="/images/empty-bookings.jpg"
              alt="No walks yet"
              className="w-28 h-28 object-cover rounded-full mx-auto mb-4 shadow-sm"
              loading="lazy"
            />
            <p className="text-gray-500">{t("walker.noWalks")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {walks.map((walk) => (
            <Card key={walk.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 overflow-hidden flex-shrink-0">
                        {walk.pet?.photoUrl ? (
                          <img src={walk.pet.photoUrl} alt={walk.pet.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dog className="h-5 w-5 text-emerald-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Link href={`/dashboard/walker/walks/${walk.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 flex items-center gap-1">
                          {walk.pet?.name || t("common.pet")} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <p className="text-sm text-gray-500">{walk.owner.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateTime(walk.scheduledAt, locale)}
                      </span>
                      <span>{walk.duration}{t("bookings.min")}</span>
                    </div>
                    {walk.pickupLocation && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 ml-13">
                        <MapPin className="h-4 w-4" /> {walk.pickupLocation}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusVariant(walk.status)}>
                      {translateStatus(t, walk.status)}
                    </Badge>
                    <WalkActions bookingId={walk.id} status={walk.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
