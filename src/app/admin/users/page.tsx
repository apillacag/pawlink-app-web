import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatDate, translateRole } from "@/lib/utils"

export default async function AdminUsersPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isPremium: true,
      createdAt: true,
      _count: { select: { pets: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("admin.manageUsers")}</h1>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.name")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.email")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.role")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.status")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.pets")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.bookings")}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">{t("admin.joined")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t("common.noResults")}</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={
                            u.role === "ADMIN" ? "danger" :
                            u.role === "WALKER" ? "success" :
                            u.role === "SPECIALIST" ? "info" : "default"
                          }>
                            {translateRole(t, u.role)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {u.isVerified && <Badge variant="success">{t("admin.verified")}</Badge>}
                            {u.isPremium && <Badge variant="warning">{t("admin.premium")}</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u._count.pets}</td>
                        <td className="px-6 py-4 text-gray-500">{u._count.bookings}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt, locale)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
