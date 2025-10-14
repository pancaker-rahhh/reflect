import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NPSRatingProps {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
  colors?: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
}

export function NPSRating({ value, onChange, disabled = false, colors }: NPSRatingProps) {
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
      <div className="flex justify-between text-sm" style={{ color: colors?.text || '#6b7280' }}>
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
                  ? 'border-transparent'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
              )}
              style={{
                ...(isSelected || isHovered
                  ? {
                      backgroundColor:
                        score <= 6
                          ? '#fca5a5' // Matte pastel red
                          : score <= 8
                            ? '#fde68a' // Matte pastel yellow
                            : '#86efac', // Matte pastel green
                      color: colors?.buttonTextColor || '#ffffff',
                    }
                  : {
                      color: colors?.text || '#374151',
                    }),
              }}
            >
              {score}
            </button>
          )
        })}
      </div>

      {displayValue !== undefined && (
        <div className="text-center">
          <div className="text-lg font-medium" style={{ color: colors?.text || '#1f2937' }}>
            Score: {displayValue}
          </div>
        </div>
      )}
    </div>
  )
}
