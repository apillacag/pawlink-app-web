import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, _locale?: string): string {
  return `S/${amount.toFixed(2)}`
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

export function formatTime(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date))
}

export function translateStatus(t: (key: string) => string, status: string): string {
  const labels: Record<string, string> = {
    PENDING: t("bookings.pending"),
    PENDING_PAYMENT: t("bookings.pendingPayment"),
    CONFIRMED: t("bookings.confirmed"),
    IN_PROGRESS: t("bookings.inProgress"),
    COMPLETED: t("bookings.completed"),
    CANCELLED: t("bookings.cancelled"),
  }
  return labels[status] || status
}

export function translateServiceType(t: (key: string) => string, type: string): string {
  const labels: Record<string, string> = {
    WALKING: t("bookings.serviceWalking"),
    CONSULTATION: t("bookings.serviceConsultation"),
  }
  return labels[type] || type
}

export function translateRole(t: (key: string) => string, role: string): string {
  const labels: Record<string, string> = {
    ADMIN: t("admin.roleAdmin"),
    WALKER: t("admin.roleWalker"),
    SPECIALIST: t("admin.roleSpecialist"),
    OWNER: t("admin.roleOwner"),
  }
  return labels[role] || role
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
