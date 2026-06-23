import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CalendarDays, Stethoscope, Phone, Video } from "lucide-react"

export default async function SpecialistConsultationsPage() {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "SPECIALIST") redirect("/dashboard")

  const consultations = await prisma.booking.findMany({
    where: { specialistId: user.id },
    include: {
      pet: true,
      owner: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("specialistDash.consultations")}</h2>
        <p className="text-gray-500">{t("specialistDash.manageConsultations")}</p>
      </div>

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("specialistDash.noConsultations")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map((consult) => (
            <Card key={consult.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{consult.pet?.name || t("common.pet")}</h3>
                        <p className="text-sm text-gray-500">{t("specialistDash.ownerLabel")}: {consult.owner.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(consult.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span>{consult.duration} min</span>
                    </div>
                    {consult.owner.phone && (
                      <p className="text-sm text-gray-500 ml-13 flex items-center gap-1">
                        <Phone className="h-4 w-4" /> {consult.owner.phone}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    consult.status === "COMPLETED" ? "success" :
                    consult.status === "CANCELLED" ? "danger" : "info"
                  }>
                    {consult.status.replace("_", " ")}
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
