import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatDate, formatCurrency, translateStatus, translateServiceType } from "@/lib/utils"

export default async function AdminBookingsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/dashboard")

  const bookings = await prisma.booking.findMany({
    include: {
      pet: { select: { name: true } },
      owner: { select: { name: true } },
      walker: { select: { name: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  })

  const statusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success" as const
      case "PENDING": return "warning" as const
      case "CONFIRMED": return "info" as const
      case "IN_PROGRESS": return "info" as const
      case "CANCELLED": return "danger" as const
      default: return "default" as const
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("admin.manageBookings")}</h1>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.id")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.pet")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.owner")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.walker")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.service")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.status")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.amount")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{b.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{b.pet?.name || t("common.na")}</td>
                      <td className="px-6 py-4 text-gray-500">{b.owner.name}</td>
                      <td className="px-6 py-4 text-gray-500">{b.walker.name}</td>
                      <td className="px-6 py-4">
                        <Badge>{translateServiceType(t, b.serviceType)}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(b.status)}>{translateStatus(t, b.status)}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {b.totalAmount ? `S/${b.totalAmount.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(b.createdAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
