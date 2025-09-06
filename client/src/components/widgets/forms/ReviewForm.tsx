import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  onSubmit: (data: { rating: number; review: string }) => Promise<void>
  isSubmitting?: boolean
  colors: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
  content: {
    mainQuestion: string
    submitButtonText: string
  }
}

export function ReviewForm({ onSubmit, isSubmitting, colors, content }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [review, setReview] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) return
    await onSubmit({ rating, review })
  }

  const renderStars = () => {
    return (
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={isSubmitting}
            className="p-2 transition-all duration-200 hover:scale-125 disabled:cursor-not-allowed transform"
            style={{
              filter: star <= (hoveredRating || rating) ? `drop-shadow(0 0 8px #FCD34D)` : 'none',
            }}
          >
            <Star
              className={cn(
                'w-9 h-9 transition-all duration-200',
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400 scale-110'
                  : 'text-gray-300 hover:text-gray-400'
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingText = () => {
    const currentRating = hoveredRating || rating
    const texts = ['', 'Poor 😞', 'Fair 🙁', 'Good 😊', 'Very Good 😄', 'Excellent 🤩']
    const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']

    return {
      text: texts[currentRating] || '',
      color: colors[currentRating] || (colors as any).text,
    }
  }

  const ratingInfo = getRatingText()

  return (
    <div className="space-y-6">
      <div className="text-center">
        {renderStars()}

        {(hoveredRating || rating) > 0 && (
          <div className="mb-4">
            <p className="text-lg font-semibold animate-pulse" style={{ color: ratingInfo.color }}>
              {ratingInfo.text}
            </p>
            <div
              className="w-20 h-1 mx-auto mt-2 rounded-full"
              style={{ backgroundColor: `${ratingInfo.color}40` }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: ratingInfo.color,
                  width: `${((hoveredRating || rating) / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {rating > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Share more details (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What specifically did you like or dislike? Your feedback helps us improve..."
              className="w-full h-28 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all text-sm"
              style={{
                borderColor: review.trim() ? colors.primary : '#E5E7EB',
                backgroundColor: colors.background,
                color: colors.text,
                boxShadow: review.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
              }}
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
              {review.length}/500
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transform"
            style={{
              backgroundColor: colors.buttonColor,
              color: colors.buttonTextColor,
              boxShadow: `0 4px 12px ${colors.buttonColor}30`,
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Review...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>⭐</span>
                <span>{content.submitButtonText}</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
