import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, CalendarDays, Dog, Wallet, TrendingUp, UserCheck } from "lucide-react"

export default async function AdminPage() {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/dashboard")

  const [totalUsers, totalBookings, totalPets, totalWalkers, totalSpecialists, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.pet.count(),
    prisma.user.count({ where: { role: "WALKER" } }),
    prisma.user.count({ where: { role: "SPECIALIST" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ])

  const stats = [
    { label: t("admin.totalUsers"), value: totalUsers, icon: Users, color: "text-emerald-600" },
    { label: t("admin.totalBookings"), value: totalBookings, icon: CalendarDays, color: "text-blue-600" },
    { label: t("admin.totalPets"), value: totalPets, icon: Dog, color: "text-amber-600" },
    { label: t("admin.walkers"), value: totalWalkers, icon: UserCheck, color: "text-purple-600" },
    { label: t("admin.specialists"), value: totalSpecialists, icon: TrendingUp, color: "text-rose-600" },
    { label: t("admin.revenue"), value: `S/${(revenue._sum.amount || 0).toFixed(2)}`, icon: Wallet, color: "text-emerald-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("admin.dashboard")}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <a href="/admin/users" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <Users className="h-10 w-10 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">{t("admin.manageUsers")}</p>
                  <p className="text-sm text-gray-500">{t("admin.manageUsersDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </a>
          <a href="/admin/bookings" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <CalendarDays className="h-10 w-10 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">{t("admin.manageBookings")}</p>
                  <p className="text-sm text-gray-500">{t("admin.manageBookingsDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </div>
  )
}
