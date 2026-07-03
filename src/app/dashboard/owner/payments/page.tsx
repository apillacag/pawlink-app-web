import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Wallet, CreditCard, Smartphone, QrCode } from "lucide-react"
import { formatDate, formatCurrency, translateServiceType } from "@/lib/utils"

const methodIcons: Record<string, any> = {
  credit_card: CreditCard,
  yape: Smartphone,
  plin: QrCode,
  wallet: Wallet,
}

export default async function OwnerPaymentsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: {
      booking: {
        select: {
          serviceType: true,
          pet: { select: { name: true } },
          walker: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalSpent = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">{t("payments.total")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpent, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">{t("walkPayments.completedPayments")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.filter((p) => p.status === "COMPLETED").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">{t("payments.balance")}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(user.walletBalance || 0, locale)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("payments.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("payments.noPayments")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-500">{t("payments.reference")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("bookings.service")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("bookings.walker")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("bookings.petLabel")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("payments.method")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("bookings.amount")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("bookings.status")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("payments.datePaid")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const Icon = methodIcons[payment.method || ""] || CreditCard
                    return (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-900 font-mono text-xs">{payment.reference || payment.id.slice(0, 8)}</td>
                        <td className="py-3 text-gray-700">{payment.booking ? translateServiceType(t, payment.booking.serviceType) : "-"}</td>
                        <td className="py-3 text-gray-700">{payment.booking?.walker?.name || "-"}</td>
                        <td className="py-3 text-gray-700">{payment.booking?.pet?.name || "-"}</td>
                        <td className="py-3 text-gray-700">
                          <span className="inline-flex items-center gap-1">
                            <Icon className="h-3.5 w-3.5 text-gray-400" />
                            {payment.method === "credit_card" ? t("payments.card") : payment.method === "wallet" ? t("payments.wallet") : payment.method === "yape" ? t("payments.yape") : payment.method === "plin" ? t("payments.plin") : payment.method?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-gray-900">{formatCurrency(payment.amount, locale)}</td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${payment.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                            {payment.status === "COMPLETED" ? t("bookings.completed") : t("bookings.pending")}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{formatDate(payment.createdAt, locale)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
