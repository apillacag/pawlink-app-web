import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Wallet, TrendingUp, CalendarDays, PiggyBank } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

export default async function WalkerEarningsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "WALKER") redirect("/dashboard")

  const [earningsTransactions, completedWalks, totalPlatformRevenue] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId: user.id, type: "EARNING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { walkerId: user.id, status: "COMPLETED" } }),
    prisma.platformRevenue.aggregate({
      _sum: { amount: true },
    }),
  ])

  const totalEarnings = earningsTransactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t("walker.earnings")}</h2>
        <p className="text-gray-500">{t("walker.trackEarnings")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("walker.totalEarnings")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
              </div>
              <Wallet className="h-8 w-8 text-emerald-600 opacity-80" />
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
                  {completedWalks > 0 ? formatCurrency(totalEarnings / completedWalks) : formatCurrency(0)}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("finance.walletBalance")}</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(user.walletBalance || 0)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("walker.paymentHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("walker.noPayments")}</p>
          ) : (
            <div className="space-y-3">
              {earningsTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description || t("finance.earning")}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt, locale)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(tx.amount)}</p>
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
