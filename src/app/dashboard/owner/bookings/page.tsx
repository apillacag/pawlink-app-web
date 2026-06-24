import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default async function OwnerBookingsPage() {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

  const bookings = await prisma.booking.findMany({
    where: { ownerId: user.id },
    include: {
      pet: true,
      walker: { select: { name: true } },
      specialist: { select: { name: true } },
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{t("bookings.title")}</h2>
        <Link href="/dashboard/owner/walkers">
          <Button>{t("bookings.bookWalk")}</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t("bookings.noBookings")}</p>
            <Link href="/dashboard/owner/walkers">
              <Button>{t("bookings.findWalker")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{booking.pet?.name || t("common.pet")}</h3>
                      <Badge variant={statusVariant(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span>{t("bookings.duration")}: {booking.duration}{t("bookings.min")}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.serviceType === "CONSULTATION" ? t("auth.specialist") : t("bookings.walker")}: <span className="font-medium">{booking.specialist?.name || booking.walker.name}</span>
                    </p>
                    {booking.pickupLocation && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {booking.pickupLocation}
                      </p>
                    )}
                    {booking.totalAmount && (
                      <p className="text-sm font-semibold text-emerald-600">
                        S/{booking.totalAmount.toFixed(2)}
                      </p>
                    )}
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
