import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NPSRatingProps {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function NPSRating({ value, onChange, disabled = false }: NPSRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const handleClick = (score: number) => {
    if (!disabled) {
      onChange(score)
    }
  }

  const handleMouseEnter = (score: number) => {
    if (!disabled) {
      setHoveredValue(score)
    }
  }

  const handleMouseLeave = () => {
    setHoveredValue(null)
  }

  const displayValue = hoveredValue ?? value

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Not likely at all</span>
        <span>Extremely likely</span>
      </div>

      <div className="flex gap-2 justify-center">
        {Array.from({ length: 11 }, (_, i) => {
          const score = i
          const isSelected = value === score
          const isHovered = hoveredValue === score

          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(score)}
              onMouseEnter={() => handleMouseEnter(score)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'w-12 h-12 rounded-full border-2 transition-all duration-200 font-semibold flex items-center justify-center',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed',
                isSelected || isHovered
                  ? 'text-foreground border-transparent'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border'
              )}
              style={
                isSelected || isHovered
                  ? {
                      backgroundColor:
                        score <= 6
                          ? 'hsl(var(--metric-pink))' // Pastel pink for detractors
                          : score <= 8
                            ? 'hsl(var(--metric-amber))' // Pastel amber for passives
                            : 'hsl(var(--metric-green))', // Pastel green for promoters
                    }
                  : undefined
              }
            >
              {score}
            </button>
          )
        })}
      </div>

      {displayValue !== undefined && (
        <div className="text-center">
          <div className="text-lg font-medium text-foreground">Score: {displayValue}</div>
        </div>
      )}
    </div>
  )
}
