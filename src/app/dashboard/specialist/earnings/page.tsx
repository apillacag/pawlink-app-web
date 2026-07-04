import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Wallet, TrendingUp, CalendarDays, PiggyBank } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

export default async function SpecialistEarningsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "SPECIALIST") redirect("/dashboard")

  const [earningsTransactions, totalConsultations, completedConsultations] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId: user.id, type: "EARNING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { specialistId: user.id } }),
    prisma.booking.count({ where: { specialistId: user.id, status: "COMPLETED" } }),
  ])

  const totalEarnings = earningsTransactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("specialistDash.earnings")}</h2>
        <p className="text-gray-500">{t("specialistDash.trackEarnings")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("specialistDash.totalEarnings")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings, locale)}</p>
              </div>
              <Wallet className="h-8 w-8 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("specialistDash.totalConsultations")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalConsultations}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("specialistDash.completedConsultations")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedConsultations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("specialistDash.avgPerConsultation")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {completedConsultations > 0 ? formatCurrency(totalEarnings / completedConsultations, locale) : formatCurrency(0, locale)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("finance.walletBalance")}</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(user.walletBalance || 0, locale)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("specialistDash.earningsHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("specialistDash.noEarnings")}</p>
          ) : (
            <div className="space-y-3">
              {earningsTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description || t("finance.earning")}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt, locale)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(tx.amount, locale)}</p>
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
