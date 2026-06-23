import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-emerald-100 text-emerald-800": variant === "success",
          "bg-amber-100 text-amber-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "danger",
          "bg-blue-100 text-blue-800": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
