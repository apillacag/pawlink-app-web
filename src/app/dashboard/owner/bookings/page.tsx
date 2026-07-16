import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CalendarDays, MapPin, AlertTriangle, Dog } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { PendingPaymentActions } from "@/components/bookings/PendingPaymentActions"
import { translateStatus, formatDateTime, formatCurrency } from "@/lib/utils"

export default async function OwnerBookingsPage() {
  const { t, locale } = await getServerTranslations()
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

  const sorted = [...bookings].sort((a, b) => {
    if (a.status === "PENDING_PAYMENT" && b.status !== "PENDING_PAYMENT") return -1
    if (a.status !== "PENDING_PAYMENT" && b.status === "PENDING_PAYMENT") return 1
    return 0
  })

  const statusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success" as const
      case "PENDING": return "warning" as const
      case "PENDING_PAYMENT": return "warning" as const
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

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <img
              src="/images/empty-bookings.jpg"
              alt="No bookings yet"
              className="w-28 h-28 object-cover rounded-full mx-auto mb-4 shadow-sm"
              loading="lazy"
            />
            <p className="text-gray-500 mb-4">{t("bookings.noBookings")}</p>
            <Link href="/dashboard/owner/walkers">
              <Button>{t("bookings.findWalker")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((booking) => (
            <Card key={booking.id} className={booking.status === "PENDING_PAYMENT" ? "border-amber-300 ring-1 ring-amber-200" : ""}>
              <CardContent className="p-6">
                {booking.status === "PENDING_PAYMENT" && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{t("bookings.pendingPaymentMessage")}</span>
                  </div>
                )}
                {booking.status === "PENDING" && booking.serviceType === "CONSULTATION" && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4 text-sm text-blue-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{t("bookings.pendingConsultationMessage")}</span>
                  </div>
                )}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 overflow-hidden flex-shrink-0">
                            {booking.pet?.photoUrl ? (
                              <img src={booking.pet.photoUrl} alt={booking.pet.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Dog className="h-5 w-5 text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900">{booking.pet?.name || t("common.pet")}</h3>
                      <Badge variant={statusVariant(booking.status)}>
                        {booking.status === "PENDING" && booking.serviceType === "CONSULTATION" ? t("bookings.pendingSpecialistConfirmation") : translateStatus(t, booking.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateTime(booking.scheduledAt, locale)}
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
                        {formatCurrency(booking.totalAmount, locale)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    {booking.status === "PENDING_PAYMENT" && (
                      <PendingPaymentActions bookingId={booking.id} />
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
