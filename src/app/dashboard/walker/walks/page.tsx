import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CalendarDays, Dog, MapPin } from "lucide-react"

export default async function WalkerWalksPage() {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") redirect("/dashboard")

  const walks = await prisma.booking.findMany({
    where: { walkerId: user.id },
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
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("walker.noWalks")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {walks.map((walk) => (
            <Card key={walk.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Dog className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{walk.pet?.name || t("common.pet")}</h3>
                        <p className="text-sm text-gray-500">{t("walker.ownerLabel")}: {walk.owner.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(walk.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span>{walk.duration}{t("bookings.min")}</span>
                    </div>
                    {walk.pickupLocation && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 ml-13">
                        <MapPin className="h-4 w-4" /> {walk.pickupLocation}
                      </p>
                    )}
                    {walk.owner.phone && (
                      <p className="text-sm text-gray-500 ml-13">{t("walker.phoneLabel")}: {walk.owner.phone}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant(walk.status)}>
                    {walk.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
