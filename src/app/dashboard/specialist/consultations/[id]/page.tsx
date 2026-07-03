import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Phone, Clock, Dog, FileText } from "lucide-react"
import { WalkActions } from "@/components/walk/WalkActions"
import { AddNote } from "@/components/walk/AddNote"
import { translateStatus, formatDateTime } from "@/lib/utils"

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "SPECIALIST") redirect("/dashboard")

  const { id } = await params
  const consult = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true, email: true } },
      walkUpdates: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!consult || consult.specialistId !== user.id) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/specialist/consultations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("specialistDash.consultationDetails")}</h2>
          <p className="text-gray-500">{consult.pet?.name} - {formatDateTime(consult.scheduledAt, locale)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            consult.status === "COMPLETED" ? "success" :
            consult.status === "CANCELLED" ? "danger" : "info"
          }>
            {translateStatus(t, consult.status)}
          </Badge>
          <WalkActions bookingId={consult.id} status={consult.status} type="consultation" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("walker.petInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Dog className="h-5 w-5 text-amber-600" />
              <span className="font-medium">{consult.pet?.name}</span>
            </div>
            <p className="text-sm text-gray-500">{t("walker.speciesLabel")}: {consult.pet?.species}</p>
            {consult.pet?.breed && <p className="text-sm text-gray-500">{t("walker.breedLabel")}: {consult.pet.breed}</p>}
            {consult.pet?.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-amber-800 font-medium">{t("walker.notesLabel")}:</p>
                <p className="text-sm text-amber-700">{consult.pet.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("walker.ownerInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{consult.owner.name}</p>
            {consult.owner.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="h-4 w-4" /> {consult.owner.phone}
              </p>
            )}
            <p className="text-sm text-gray-500">{consult.owner.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("specialistDash.sessionInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {formatDateTime(consult.scheduledAt, locale)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{t("specialistDash.duration")}: {consult.duration}{t("bookings.min")}</p>
          {consult.totalAmount && (
            <p className="text-sm font-semibold text-purple-600">{t("specialistDash.fee")}: S/{consult.totalAmount.toFixed(2)}</p>
          )}
          {consult.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">{consult.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("specialistDash.sessionNotes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AddNote bookingId={consult.id} />
          {consult.walkUpdates.length > 0 && (
            <div className="space-y-3 mt-4">
              {consult.walkUpdates.map((update) => (
                <div key={update.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                  <div>
                    <p className="text-gray-700">{update.note}</p>
                    <p className="text-gray-400 text-xs">{new Date(update.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
