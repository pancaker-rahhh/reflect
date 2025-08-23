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

  const getScoreColor = (score: number) => {
    // Pastel gradient from red to green (0-10)
    const colors = [
      'bg-gradient-to-br from-red-300 to-red-400 hover:from-red-400 hover:to-red-500', // 0
      'bg-gradient-to-br from-red-300 to-red-400 hover:from-red-400 hover:to-red-500', // 1
      'bg-gradient-to-br from-red-300 to-orange-300 hover:from-red-400 hover:to-orange-400', // 2
      'bg-gradient-to-br from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500', // 3
      'bg-gradient-to-br from-orange-300 to-yellow-300 hover:from-orange-400 hover:to-yellow-400', // 4
      'bg-gradient-to-br from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500', // 5
      'bg-gradient-to-br from-yellow-300 to-amber-300 hover:from-yellow-400 hover:to-amber-400', // 6
      'bg-gradient-to-br from-amber-300 to-lime-300 hover:from-amber-400 hover:to-lime-400', // 7
      'bg-gradient-to-br from-lime-300 to-green-300 hover:from-lime-400 hover:to-green-400', // 8
      'bg-gradient-to-br from-green-300 to-green-400 hover:from-green-400 hover:to-green-500', // 9
      'bg-gradient-to-br from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500', // 10
    ]
    return colors[score] || colors[0]
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
