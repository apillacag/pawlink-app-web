import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { CalendarDays, Dog, Users, Wallet, Star, TrendingUp } from "lucide-react"
import { translateStatus, translateServiceType, formatCurrency, formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let stats: { label: string; value: string; icon: any; color: string }[] = []

  if (user.role === "OWNER") {
    const petCount = await prisma.pet.count({ where: { ownerId: user.id } })
    const bookingCount = await prisma.booking.count({ where: { ownerId: user.id } })
    const pendingPayments = await prisma.booking.count({
      where: { ownerId: user.id, status: "PENDING_PAYMENT" },
    })
    const upcomingBookings = await prisma.booking.count({
      where: { ownerId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
    })
    stats = [
      { label: t("dashboard.totalPets"), value: petCount.toString(), icon: Dog, color: "text-emerald-600" },
      { label: t("dashboard.totalBookings"), value: bookingCount.toString(), icon: CalendarDays, color: "text-blue-600" },
      { label: t("payments.pendingPayments"), value: pendingPayments.toString(), icon: TrendingUp, color: pendingPayments > 0 ? "text-amber-600" : "text-gray-400" },
      { label: t("dashboard.upcoming"), value: upcomingBookings.toString(), icon: TrendingUp, color: "text-amber-600" },
    ]
  } else if (user.role === "WALKER") {
    const walkCount = await prisma.booking.count({ where: { walkerId: user.id } })
    const completedCount = await prisma.booking.count({ where: { walkerId: user.id, status: "COMPLETED" } })
    const earnings = await prisma.payment.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _sum: { amount: true },
    })
    stats = [
      { label: t("dashboard.totalWalks"), value: walkCount.toString(), icon: CalendarDays, color: "text-emerald-600" },
      { label: t("dashboard.completed"), value: completedCount.toString(), icon: Star, color: "text-blue-600" },
      { label: t("dashboard.earnings"), value: formatCurrency(earnings._sum.amount || 0, locale), icon: Wallet, color: "text-amber-600" },
    ]
  } else if (user.role === "SPECIALIST") {
    const sessionCount = await prisma.booking.count({ where: { specialistId: user.id } })
    const completedCount = await prisma.booking.count({ where: { specialistId: user.id, status: "COMPLETED" } })
    stats = [
      { label: t("dashboard.totalSessions"), value: sessionCount.toString(), icon: CalendarDays, color: "text-emerald-600" },
      { label: t("dashboard.completed"), value: completedCount.toString(), icon: Star, color: "text-blue-600" },
    ]
  } else {
    const userCount = await prisma.user.count()
    const bookingCount = await prisma.booking.count()
    stats = [
      { label: t("dashboard.totalUsers"), value: userCount.toString(), icon: Users, color: "text-emerald-600" },
      { label: t("dashboard.totalBookings"), value: bookingCount.toString(), icon: CalendarDays, color: "text-blue-600" },
    ]
  }

  const recentBookings = await prisma.booking.findMany({
    where: user.role === "OWNER" ? { ownerId: user.id } : user.role === "WALKER" ? { walkerId: user.id } : user.role === "SPECIALIST" ? { specialistId: user.id } : {},
    include: {
      pet: true,
      owner: { select: { name: true } },
      walker: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-8">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
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

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("dashboard.noActivity")}</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Dog className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.pet?.name || t("common.pet")} - {translateServiceType(t, booking.serviceType)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.scheduledAt, locale)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    booking.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    booking.status === "PENDING_PAYMENT" ? "bg-amber-100 text-amber-700" :
                    booking.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    booking.status === "IN_PROGRESS" ? "bg-purple-100 text-purple-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {translateStatus(t, booking.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {user.role === "OWNER" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/owner/pets">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <Dog className="h-10 w-10 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">{t("dashboard.managePets")}</p>
                  <p className="text-sm text-gray-500">{t("dashboard.managePetsDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/owner/walkers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <Users className="h-10 w-10 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">{t("dashboard.findWalkers")}</p>
                  <p className="text-sm text-gray-500">{t("dashboard.findWalkersDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
