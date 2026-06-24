"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PawPrint, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { LanguageToggle } from "@/components/ui/LanguageToggle"
import { useI18n } from "@/i18n/context"

interface NavbarProps {
  user?: {
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/walkers", label: t("nav.findWalkers") },
    { href: "/specialists", label: t("nav.specialists") },
    { href: "/about", label: t("nav.about") },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">PawLink</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600",
                  pathname === link.href ? "text-emerald-600" : "text-gray-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-20">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {t("nav.profile")}
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <Link
                        href="/api/auth/logout"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("nav.signOut")}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t("nav.signIn")}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t("nav.getStarted")}</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              className="rounded-lg p-2 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block text-sm font-medium transition-colors hover:text-emerald-600",
                  pathname === link.href ? "text-emerald-600" : "text-gray-600"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-200" />
            {user ? (
              <>
                <Link href="/dashboard" className="block text-sm font-medium text-gray-700 hover:text-emerald-600" onClick={() => setMobileOpen(false)}>{t("nav.dashboard")}</Link>
                <Link href="/api/auth/logout" className="block text-sm font-medium text-red-600">{t("nav.signOut")}</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-gray-700 hover:text-emerald-600" onClick={() => setMobileOpen(false)}>{t("nav.signIn")}</Link>
                <Link href="/register" className="block text-sm font-medium text-emerald-600" onClick={() => setMobileOpen(false)}>{t("nav.getStarted")}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
