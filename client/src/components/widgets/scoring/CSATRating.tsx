import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CSATRatingProps {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

const satisfactionLevels = [
  { value: 1, label: 'Very Bad', emoji: '😡', color: 'bg-red-500 hover:bg-red-600' },
  { value: 2, label: 'Bad', emoji: '😕', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 3, label: 'OK', emoji: '😐', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 4, label: 'Good', emoji: '😊', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 5, label: 'Great', emoji: '😍', color: 'bg-green-500 hover:bg-green-600' },
]

export function CSATRating({ value, onChange, disabled = false }: CSATRatingProps) {
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
  const displayLevel = satisfactionLevels.find((level) => level.value === displayValue)

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        {satisfactionLevels.map((level) => {
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
                'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'min-w-[80px]',
                disabled && 'opacity-50 cursor-not-allowed',
                isSelected || isHovered
                  ? `${level.color} text-white border-transparent shadow-lg`
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              )}
            >
              <span className="text-3xl mb-2 transition-transform duration-200 hover:scale-110">
                {level.emoji}
              </span>
              <span className="text-xs font-medium text-center leading-tight">{level.label}</span>
            </button>
          )
        })}
      </div>

      {displayLevel && (
        <div className="text-center animate-fade-in">
          <div className="text-lg font-medium text-gray-800">{displayLevel.label}</div>
          <div className="text-sm text-gray-600">Score: {displayLevel.value}/5</div>
        </div>
      )}
    </div>
  )
}
