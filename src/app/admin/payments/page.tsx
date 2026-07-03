import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Wallet, CreditCard, TrendingUp, CalendarDays, Smartphone, QrCode } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

const methodIcons: Record<string, any> = {
  credit_card: CreditCard,
  yape: Smartphone,
  plin: QrCode,
  wallet: Wallet,
}

export default async function AdminPaymentsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/dashboard")

  const [payments, todayPayments] = await Promise.all([
    prisma.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        booking: {
          select: {
            pet: { select: { name: true } },
            walker: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  const todayRevenue = todayPayments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  const byMethod = payments
    .filter((p) => p.status === "COMPLETED" && p.method)
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.method!] = (acc[p.method!] || 0) + p.amount
      return acc
    }, {})

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.dashboard")} - {t("payments.history")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("admin.revenue")}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue, locale)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("admin.todayRevenue")}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(todayRevenue, locale)}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("admin.totalTransactions")}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(byMethod).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(byMethod).map(([method, amount]) => {
            const Icon = methodIcons[method] || CreditCard
            return (
              <Card key={method}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 capitalize">{method.replace("_", " ")}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(amount, locale)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.latestPayments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">{t("payments.reference")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("payments.paidBy")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("bookings.service")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("payments.method")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("bookings.amount")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("bookings.status")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("payments.datePaid")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 50).map((payment) => {
                  const Icon = methodIcons[payment.method || ""] || CreditCard
                  return (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-900 font-mono text-xs">{payment.reference || payment.id.slice(0, 8)}</td>
                      <td className="py-3 text-gray-700">{payment.user?.name || "-"}</td>
                      <td className="py-3 text-gray-700">{payment.booking?.pet?.name || "-"}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5 text-gray-400" />
                          {payment.method === "credit_card" ? t("payments.card") : payment.method?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(payment.amount, locale)}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${payment.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                          {payment.status === "COMPLETED" ? t("bookings.completed") : payment.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(payment.createdAt, locale)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
