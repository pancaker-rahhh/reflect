import { useState, useCallback } from 'react'
import type {
  FeedbackData,
  FeedbackType,
  NPSFeedbackData,
  CSATFeedbackData,
  CESFeedbackData,
} from './types'

interface UseFeedbackSubmissionProps {
  mode: 'preview' | 'production'
  onSubmit?: (data: FeedbackData) => Promise<void>
  onStateChange?: (state: any) => void
  getAvailableFeedbackTypes: () => FeedbackType[]
}

export function useFeedbackSubmission({
  mode,
  onSubmit,
  onStateChange,
  getAvailableFeedbackTypes,
}: UseFeedbackSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFeedbackData = useCallback((data: FeedbackData): string | null => {
    // Basic validation
    if (!data.response || !data.response.trim()) {
      return 'Feedback message is required'
    }

    if (data.response.length > 5000) {
      return 'Feedback message is too long (maximum 5000 characters)'
    }

    // Type-specific validation
    if (data.typeSpecificData) {
      if (data.feedbackType === 'REVIEW' && data.rating && (data.rating < 1 || data.rating > 5)) {
        return 'Rating must be between 1 and 5 stars'
      }

      if (data.feedbackType === 'NPS' && 'nps_score' in data.typeSpecificData) {
        const npsData = data.typeSpecificData as NPSFeedbackData
        if (npsData.nps_score < 0 || npsData.nps_score > 10) {
          return 'NPS score must be between 0 and 10'
        }
      }

      if (data.feedbackType === 'CSAT' && 'csat_score' in data.typeSpecificData) {
        const csatData = data.typeSpecificData as CSATFeedbackData
        if (csatData.csat_score < 1 || csatData.csat_score > 5) {
          return 'Score must be between 1 and 5'
        }
      }

      if (data.feedbackType === 'CES' && 'ces_score' in data.typeSpecificData) {
        const cesData = data.typeSpecificData as CESFeedbackData
        if (cesData.ces_score < 1 || cesData.ces_score > 5) {
          return 'Score must be between 1 and 5'
        }
      }

      if (data.feedbackType === 'BUG_REPORT' && 'title' in data.typeSpecificData) {
        const bugData = data.typeSpecificData as any
        if (!bugData.title.trim()) {
          return 'Bug title is required'
        }
      }

      if (data.feedbackType === 'FEATURE_REQUEST' && 'title' in data.typeSpecificData) {
        const featureData = data.typeSpecificData as any
        if (!featureData.title.trim()) {
          return 'Feature title is required'
        }
      }
    }

    return null // No validation errors
  }, [])

  const handleSubmit = useCallback(
    async (data: FeedbackData) => {
      // Client-side validation
      const validationError = validateFeedbackData(data)
      if (validationError) {
        setError(validationError)
        return
      }

      if (mode === 'preview') {
        setIsSubmitting(true)
        setTimeout(() => {
          setIsSubmitting(false)
          const availableTypes = getAvailableFeedbackTypes()
          if (availableTypes.length > 1) {
            onStateChange?.({ type: 'menu', availableTypes })
          } else {
            onStateChange?.({ type: 'success' })
          }
        }, 1000)
      } else {
        if (onSubmit) {
          try {
            setIsSubmitting(true)
            await onSubmit(data)
            const availableTypes = getAvailableFeedbackTypes()
            if (availableTypes.length > 1) {
              onStateChange?.({ type: 'menu', availableTypes })
            } else {
              onStateChange?.({ type: 'success' })
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed')
          } finally {
            setIsSubmitting(false)
          }
        }
      }
    },
    [mode, onSubmit, onStateChange, getAvailableFeedbackTypes, validateFeedbackData]
  )

  const handleScoreSubmission = useCallback(
    async (score: number, feedbackType: FeedbackType) => {
      const type = feedbackType.toLowerCase()

      // Prepare type-specific data based on feedback type
      let typeSpecificData: NPSFeedbackData | CSATFeedbackData | CESFeedbackData

      if (feedbackType === 'NPS') {
        const npsData: NPSFeedbackData = {
          nps_score: score,
          promoter_category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor',
          follow_up_comment: '',
        }
        typeSpecificData = npsData
      } else if (feedbackType === 'CSAT') {
        const satisfactionLevels: Array<CSATFeedbackData['satisfaction_level']> = [
          'very_dissatisfied',
          'very_dissatisfied',
          'dissatisfied',
          'neutral',
          'satisfied',
          'very_satisfied',
        ]
        const csatData: CSATFeedbackData = {
          csat_score: score,
          satisfaction_level: satisfactionLevels[score] || 'neutral',
          follow_up_comment: '',
        }
        typeSpecificData = csatData
      } else if (feedbackType === 'CES') {
        const easeLevels: Array<CESFeedbackData['ease_level']> = [
          'very_difficult',
          'very_difficult',
          'difficult',
          'neutral',
          'easy',
          'very_easy',
        ]
        const cesData: CESFeedbackData = {
          ces_score: score,
          ease_level: easeLevels[score] || 'neutral',
          follow_up_comment: '',
        }
        typeSpecificData = cesData
      } else {
        // Fallback for unexpected types
        const fallbackData: NPSFeedbackData = {
          nps_score: score,
          promoter_category: 'passive',
          follow_up_comment: '',
        }
        typeSpecificData = fallbackData
      }

      await handleSubmit({
        response: `${type}: ${score}`,
        rating: score,
        score: score, // Backend expects 'score' for CSAT/CES/NPS
        feedbackType,
        typeSpecificData,
      })
    },
    [handleSubmit]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isSubmitting,
    error,
    handleSubmit,
    handleScoreSubmission,
    clearError,
  }
}
