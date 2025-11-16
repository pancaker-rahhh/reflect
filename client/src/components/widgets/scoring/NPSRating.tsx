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
    if (!disabled) {
      setHoveredValue(null)
    }
  }

  const getScoreColor = (score: number) => {
    // NPS color coding: Detractors (1-6), Passives (7-8), Promoters (9-10)
    if (score <= 6) {
      return {
        bg: '#ef4444',
        bgLight: '#fee2e2',
        border: '#f87171',
      }
    } else if (score <= 8) {
      return {
        bg: '#f59e0b',
        bgLight: '#fef3c7',
        border: '#fbbf24',
      }
    } else {
      return {
        bg: '#10b981',
        bgLight: '#d1fae5',
        border: '#34d399',
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: value !== undefined ? getScoreColor(value).bgLight : '#f3f4f6',
            color: value !== undefined ? getScoreColor(value).bg : '#6b7280',
          }}
        >
          <span className="text-lg mr-1">{value !== undefined ? value : '?'}</span>
          <span className="text-xs opacity-75">/ 10</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: 5 }, (_, i) => {
            const score = i + 1
            const isSelected = value === score
            const isHovered = hoveredValue === score
            const scoreColors = getScoreColor(score)

            return (
              <button
                key={score}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(score)}
                onMouseEnter={() => handleMouseEnter(score)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  'w-10 h-10 flex-shrink-0 rounded-lg border-2 font-semibold flex items-center justify-center text-sm',
                  'transition-all duration-150 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  disabled && 'opacity-50 cursor-not-allowed',
                  !disabled && 'cursor-pointer',
                  isSelected && 'shadow-lg'
                )}
                style={{
                  ...(isSelected
                    ? {
                        backgroundColor: scoreColors.bg,
                        borderColor: scoreColors.bg,
                        color: '#ffffff',
                        boxShadow: `0 4px 12px ${scoreColors.bg}40`,
                        transform: 'scale(1.08)',
                      }
                    : isHovered
                      ? {
                          backgroundColor: scoreColors.bgLight,
                          borderColor: scoreColors.border,
                          color: scoreColors.bg,
                          transform: 'scale(1.05)',
                        }
                      : {
                          backgroundColor: colors?.background || '#ffffff',
                          borderColor: '#d1d5db',
                          color: colors?.text || '#374151',
                          transform: 'scale(1)',
                        }),
                }}
                aria-label={`Rate ${score} out of 10`}
              >
                {score}
              </button>
            )
          })}
        </div>

        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: 5 }, (_, i) => {
            const score = i + 6
            const isSelected = value === score
            const isHovered = hoveredValue === score
            const scoreColors = getScoreColor(score)

            return (
              <button
                key={score}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(score)}
                onMouseEnter={() => handleMouseEnter(score)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  'w-10 h-10 flex-shrink-0 rounded-lg border-2 font-semibold flex items-center justify-center text-sm',
                  'transition-all duration-150 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  disabled && 'opacity-50 cursor-not-allowed',
                  !disabled && 'cursor-pointer',
                  isSelected && 'shadow-lg'
                )}
                style={{
                  ...(isSelected
                    ? {
                        backgroundColor: scoreColors.bg,
                        borderColor: scoreColors.bg,
                        color: '#ffffff',
                        boxShadow: `0 4px 12px ${scoreColors.bg}40`,
                        transform: 'scale(1.08)',
                      }
                    : isHovered
                      ? {
                          backgroundColor: scoreColors.bgLight,
                          borderColor: scoreColors.border,
                          color: scoreColors.bg,
                          transform: 'scale(1.05)',
                        }
                      : {
                          backgroundColor: colors?.background || '#ffffff',
                          borderColor: '#d1d5db',
                          color: colors?.text || '#374151',
                          transform: 'scale(1)',
                        }),
                }}
                aria-label={`Rate ${score} out of 10`}
              >
                {score}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="flex justify-between items-center text-xs px-1"
        style={{ color: colors?.text ? `${colors.text}99` : '#9ca3af' }}
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Not likely
        </span>
        <span className="flex items-center gap-1">
          Very likely
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  )
}
