import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatDate, translateStatus } from "@/lib/utils"
import { Dog, Cat, CalendarDays, Weight, FileText } from "lucide-react"

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

  const { id } = await params
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { walker: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
    },
  })

  if (!pet || pet.ownerId !== user.id) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-emerald-100 overflow-hidden flex-shrink-0">
              {pet.photoUrl ? (
                <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {pet.species === "CAT" ? <Cat className="h-7 w-7 text-emerald-600" /> : <Dog className="h-7 w-7 text-emerald-600" />}
                </div>
              )}
            </div>
            <div>
              <CardTitle>{pet.name}</CardTitle>
              <p className="text-sm text-gray-500">{pet.breed || t(`pets.${pet.species.toLowerCase()}`)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {pet.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="h-4 w-4" /> {t("pets.ageLabel")}: {pet.age} {t("pets.years")}
              </div>
            )}
            {pet.weight && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Weight className="h-4 w-4" /> {t("pets.weightLabel")}: {pet.weight} {t("pets.kg")}
              </div>
            )}
          </div>
          {pet.notes && (
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <FileText className="h-4 w-4 mt-0.5" />
              <p>{pet.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pets.recentWalks")}</CardTitle>
        </CardHeader>
        <CardContent>
          {pet.bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("pets.noWalks")}</p>
          ) : (
            <div className="space-y-3">
              {pet.bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(booking.scheduledAt, locale)}
                    </p>
                    <p className="text-xs text-gray-500">{t("bookings.walker")}: {booking.walker.name}</p>
                  </div>
                  <Badge variant={booking.status === "COMPLETED" ? "success" : booking.status === "CANCELLED" ? "danger" : "info"}>
                    {translateStatus(t, booking.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
