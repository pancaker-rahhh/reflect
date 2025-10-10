import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CESRatingProps {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

const effortLevels = [
  { value: 1, label: 'Hard', emoji: '😤', color: 'bg-red-500 hover:bg-red-600' },
  { value: 2, label: 'Difficult', emoji: '😔', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 3, label: 'OK', emoji: '😐', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 4, label: 'Easy', emoji: '😌', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 5, label: 'Very Easy', emoji: '😊', color: 'bg-green-500 hover:bg-green-600' },
]

export function CESRating({ value, onChange, disabled = false }: CESRatingProps) {
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
  const displayLevel = effortLevels.find((level) => level.value === displayValue)

  return (
    <div className="space-y-3">
      <div className="text-center text-xs text-gray-600 mb-2">
        &quot;It was easy to get the help I needed&quot;
      </div>

      <div className="flex justify-center gap-2">
        {effortLevels.map((level) => {
          const isSelected = value === level.value
          const isHovered = hoveredValue === level.value

          return (
            <button
              key={level.value}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(level.value)}
              onMouseEnter={() => handleMouseEnter(level.value)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-300',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'min-w-[60px] max-w-[70px]',
                disabled && 'opacity-50 cursor-not-allowed',
                isSelected || isHovered
                  ? `${level.color} text-white border-transparent shadow-lg`
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              )}
            >
              <span className="text-2xl mb-1 transition-transform duration-200 hover:scale-110">
                {level.emoji}
              </span>
              <span className="text-xs font-medium text-center leading-tight">{level.label}</span>
            </button>
          )
        })}
      </div>

      {displayLevel && (
        <div className="text-center animate-fade-in">
          <div className="text-sm font-medium text-gray-800">{displayLevel.label}</div>
          <div className="text-xs text-gray-600">Score: {displayLevel.value}/5</div>
        </div>
      )}
    </div>
  )
}
