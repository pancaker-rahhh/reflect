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
  onScoreRestore?: (score: number | undefined) => void
}

interface ErrorInfo {
  message: string
  type: 'rate_limit' | 'validation' | 'network' | 'server' | 'unknown'
  retryAfter?: number // seconds
  retryAt?: Date
}

export function useFeedbackSubmission({
  mode,
  onSubmit,
  onStateChange,
  getAvailableFeedbackTypes,
  onScoreRestore,
}: UseFeedbackSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [lastActiveFeedbackType, setLastActiveFeedbackType] = useState<FeedbackType | null>(null)
  const [lastSelectedScore, setLastSelectedScore] = useState<number | undefined>(undefined)

  // Parse error message to detect rate limiting and extract retry information
  const parseError = useCallback((errorMessage: string): ErrorInfo => {
    // Check for rate limiting patterns
    if (errorMessage.includes('Too many requests') || errorMessage.includes('rate limit')) {
      // Extract retry time from message like "Please try again in 5 minutes"
      const retryMatch = errorMessage.match(/try again in (\d+) minute/i)
      const retrySeconds = retryMatch ? parseInt(retryMatch[1]) * 60 : 60 // default 1 minute

      return {
        message: errorMessage,
        type: 'rate_limit',
        retryAfter: retrySeconds,
        retryAt: new Date(Date.now() + retrySeconds * 1000),
      }
    }

    // Check for network errors
    if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
      return {
        message: errorMessage,
        type: 'network',
      }
    }

    // Check for server errors
    if (errorMessage.includes('Server') || errorMessage.includes('500')) {
      return {
        message: errorMessage,
        type: 'server',
      }
    }

    // Check for validation errors
    if (
      errorMessage.includes('required') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('must be')
    ) {
      return {
        message: errorMessage,
        type: 'validation',
      }
    }

    // Default to unknown
    return {
      message: errorMessage,
      type: 'unknown',
    }
  }, [])

  const validateFeedbackData = useCallback((data: FeedbackData): string | null => {
    // For rating-based feedback (NPS, CSAT, CES), response is optional
    const ratingBasedTypes: FeedbackType[] = ['NPS', 'CSAT', 'CES', 'REVIEW']
    const isRatingBased = ratingBasedTypes.includes(data.feedbackType)

    // Basic validation - response only required for non-rating types
    if (!isRatingBased && (!data.response || !data.response.trim())) {
      return 'Feedback message is required'
    }

    if (data.response && data.response.length > 5000) {
      return 'Feedback message is too long (maximum 5000 characters)'
    }

    // Type-specific validation
    if (data.typeSpecificData) {
      if (
        data.feedbackType === 'REVIEW' &&
        'overall_rating' in data.typeSpecificData &&
        data.typeSpecificData.overall_rating &&
        (data.typeSpecificData.overall_rating < 1 || data.typeSpecificData.overall_rating > 5)
      ) {
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
      setLastActiveFeedbackType(data.feedbackType)

      const validationError = validateFeedbackData(data)
      if (validationError) {
        const errorInfo = parseError(validationError)
        setError(validationError)
        setErrorInfo(errorInfo)
        onStateChange?.({ type: 'error' })
        return
      }

      if (mode === 'preview') {
        setIsSubmitting(true)
        setTimeout(() => {
          setIsSubmitting(false)
          onStateChange?.({ type: 'success' })
        }, 1000)
      } else {
        if (onSubmit) {
          try {
            setIsSubmitting(true)
            await onSubmit(data)
            onStateChange?.({ type: 'success' })
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Submission failed'
            const errorInfo = parseError(errorMessage)
            setError(errorMessage)
            setErrorInfo(errorInfo)
            onStateChange?.({ type: 'error' })
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
      setLastActiveFeedbackType(feedbackType)
      setLastSelectedScore(score)

      let typeSpecificData: NPSFeedbackData | CSATFeedbackData | CESFeedbackData

      if (feedbackType === 'NPS') {
        const npsData: NPSFeedbackData = {
          nps_score: score,
          promoter_category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor',
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
        }
        typeSpecificData = cesData
      } else {
        const fallbackData: NPSFeedbackData = {
          nps_score: score,
          promoter_category: 'passive',
        }
        typeSpecificData = fallbackData
      }

      await handleSubmit({
        feedbackType,
        typeSpecificData,
      })
    },
    [handleSubmit]
  )

  const clearError = useCallback(() => {
    setError(null)
    setErrorInfo(null)
    if (lastSelectedScore !== undefined) {
      onScoreRestore?.(lastSelectedScore)
    }
    if (lastActiveFeedbackType) {
      onStateChange?.({ type: 'active', feedbackType: lastActiveFeedbackType })
    } else {
      onStateChange?.({ type: 'active' })
    }
  }, [onStateChange, lastActiveFeedbackType, lastSelectedScore, onScoreRestore])

  return {
    isSubmitting,
    error,
    errorInfo,
    handleSubmit,
    handleScoreSubmission,
    clearError,
    getLastSelectedScore: () => lastSelectedScore,
  }
}
