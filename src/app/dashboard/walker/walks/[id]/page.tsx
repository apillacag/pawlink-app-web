import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Phone, Clock, Dog } from "lucide-react"
import { WalkActions } from "@/components/walk/WalkActions"
import { translateStatus, formatDateTime, formatCurrency, formatTime } from "@/lib/utils"

export default async function WalkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") redirect("/dashboard")

  const { id } = await params
  const walk = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true, email: true } },
      walkUpdates: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!walk || walk.walkerId !== user.id) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/walker/walks" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("walker.walkDetails")}</h2>
          <p className="text-gray-500">{walk.pet?.name} - {formatDateTime(walk.scheduledAt, locale)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={walk.status === "COMPLETED" ? "success" : walk.status === "IN_PROGRESS" ? "info" : "warning"}>
            {translateStatus(t, walk.status)}
          </Badge>
          <WalkActions bookingId={walk.id} status={walk.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("walker.petInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Dog className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">{walk.pet?.name}</span>
            </div>
            <p className="text-sm text-gray-500">{t("walker.speciesLabel")}: {walk.pet?.species}</p>
            {walk.pet?.breed && <p className="text-sm text-gray-500">{t("walker.breedLabel")}: {walk.pet.breed}</p>}
            {walk.pet?.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-amber-800 font-medium">{t("walker.notesLabel")}:</p>
                <p className="text-sm text-amber-700">{walk.pet.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("walker.ownerInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{walk.owner.name}</p>
            {walk.owner.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="h-4 w-4" /> {walk.owner.phone}
              </p>
            )}
            <p className="text-sm text-gray-500">{walk.owner.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("walker.walkInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {formatDateTime(walk.scheduledAt, locale)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{t("walker.duration")}: {walk.duration} {t("bookings.min")}</p>
          {walk.pickupLocation && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {t("walker.pickup")}: {walk.pickupLocation}
            </p>
          )}
          {walk.totalAmount && (
            <p className="text-sm font-semibold text-emerald-600">{t("walker.amountLabel")}: {formatCurrency(walk.totalAmount, locale)}</p>
          )}
          {walk.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">{walk.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {walk.walkUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("bookings.walkUpdates")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walk.walkUpdates.map((update) => (
                <div key={update.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <p className="text-gray-700">{update.note || `${update.type} ${t("bookings.updateNote")}`}</p>
                    <p className="text-gray-400 text-xs">{formatTime(update.createdAt, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
