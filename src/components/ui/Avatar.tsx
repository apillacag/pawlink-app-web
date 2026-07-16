import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  }

  return (
    <img
      src={src || "/images/default-avatar.jpg"}
      alt={name}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
      loading="lazy"
    />
  )
}
