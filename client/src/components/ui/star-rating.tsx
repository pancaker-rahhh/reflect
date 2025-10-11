import { Star } from 'phosphor-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating)
        const partial = index === Math.floor(rating) && rating % 1 !== 0
        const percentage = partial ? (rating % 1) * 100 : 0

        return (
          <div key={index} className="relative">
            <Star 
              className={cn(
                sizeClasses[size],
                "text-muted-foreground"
              )}
              fill="currentColor"
            />
            {(filled || partial) && (
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${percentage}%` }}
              >
                <Star 
                  className={cn(
                    sizeClasses[size],
                    "text-warning"
                  )}
                  fill="currentColor"
                />
              </div>
            )}
          </div>
        )
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}