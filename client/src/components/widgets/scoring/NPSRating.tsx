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

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detractor'
    if (score <= 8) return 'Passive'
    return 'Promoter'
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
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed',
                isSelected || isHovered
                  ? 'text-white border-transparent'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              )}
              style={
                isSelected || isHovered
                  ? {
                      backgroundColor:
                        score <= 6
                          ? '#fca5a5' // Matte pastel red
                          : score <= 8
                            ? '#fde68a' // Matte pastel yellow
                            : '#86efac', // Matte pastel green
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
          <div className="text-lg font-medium text-gray-800">Score: {displayValue}</div>
          <div
            className={cn(
              'text-sm font-medium',
              displayValue <= 6 && 'text-red-600',
              displayValue > 6 && displayValue <= 8 && 'text-yellow-600',
              displayValue > 8 && 'text-green-600'
            )}
          >
            {getScoreLabel(displayValue)}
          </div>
        </div>
      )}
    </div>
  )
}
