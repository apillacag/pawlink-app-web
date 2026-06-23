import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ rating, size = "md", interactive, onChange }: StarRatingProps) {
  const sizeClasses = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            "transition-colors",
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  )
}
