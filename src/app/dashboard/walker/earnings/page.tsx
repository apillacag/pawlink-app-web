import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { DollarSign, TrendingUp, CalendarDays } from "lucide-react"

export default async function WalkerEarningsPage() {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") redirect("/dashboard")

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: {
      booking: {
        include: { pet: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalEarnings = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  const completedWalks = await prisma.booking.count({
    where: { walkerId: user.id, status: "COMPLETED" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("walker.earnings")}</h2>
        <p className="text-gray-500">{t("walker.trackEarnings")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("walker.totalEarnings")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">S/${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("walker.completedWalks")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedWalks}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("walker.avgPerWalk")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  S/${completedWalks > 0 ? (totalEarnings / completedWalks).toFixed(2) : "0.00"}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("walker.paymentHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("walker.noPayments")}</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.booking?.pet?.name || t("common.walk")} - {payment.booking?.serviceType || t("common.service")}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">S/${payment.amount.toFixed(2)}</p>
                    <Badge variant={payment.status === "COMPLETED" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
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
