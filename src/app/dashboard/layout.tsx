import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PawPrint, LayoutDashboard, Calendar, Users, Heart, Settings, Dog, Stethoscope, Wallet } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const navItems = [
    { href: "/dashboard", label: t("dashboard.overview"), icon: LayoutDashboard },
    ...(user.role === "OWNER"
      ? [
          { href: "/dashboard/owner/pets", label: t("dashboard.myPets"), icon: Dog },
          { href: "/dashboard/owner/bookings", label: t("dashboard.bookings"), icon: Calendar },
          { href: "/dashboard/owner/payments", label: t("payments.history"), icon: Wallet },
          { href: "/dashboard/owner/walkers", label: t("dashboard.findWalkers"), icon: Users },
          { href: "/dashboard/owner/specialists", label: t("dashboard.specialists"), icon: Stethoscope },
        ]
      : []),
    ...(user.role === "WALKER"
      ? [
          { href: "/dashboard/walker/walks", label: t("dashboard.myWalks"), icon: Calendar },
          { href: "/dashboard/walker/earnings", label: t("dashboard.earnings"), icon: Heart },
          { href: "/dashboard/walker/profile", label: t("dashboard.profile"), icon: Settings },
        ]
      : []),
    ...(user.role === "SPECIALIST"
      ? [
          { href: "/dashboard/specialist/consultations", label: t("dashboard.consultations"), icon: Calendar },
          { href: "/dashboard/specialist/earnings", label: t("dashboard.earnings"), icon: Heart },
          { href: "/dashboard/specialist/profile", label: t("dashboard.profile"), icon: Settings },
        ]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { href: "/admin", label: t("dashboard.adminPanel"), icon: Settings },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
            <p className="text-gray-500">{t("dashboard.welcomeBack")}, {user.name}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
