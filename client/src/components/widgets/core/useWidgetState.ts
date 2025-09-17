import { useState, useEffect, useCallback } from 'react'
import type { WidgetState, FeedbackType, WidgetConfiguration } from './types'

interface UseWidgetStateProps {
  config: WidgetConfiguration
  externalState?: WidgetState
  onStateChange?: (state: WidgetState) => void
}

export function useWidgetState({ config, externalState, onStateChange }: UseWidgetStateProps) {
  const getInitialState = useCallback((): WidgetState => {
    if (externalState) return externalState

    const primaryType = config.primaryType || 'FEEDBACK'

    const primaryModuleMap: Record<string, keyof typeof config.modules> = {
      FEEDBACK: 'feedback',
      SURVEY: 'feedback',
      NPS: 'feedback',
      CSAT: 'feedback',
      CES: 'feedback',
      REVIEW: 'reviews',
      BUG_REPORT: 'bugReporting',
      FEATURE_REQUEST: 'featureRequests',
    }

    const primaryModuleKey = primaryModuleMap[primaryType]
    const isPrimaryTypeEnabled = config.modules?.[primaryModuleKey] || false

    if (isPrimaryTypeEnabled) {
      return { type: 'active', feedbackType: primaryType as FeedbackType }
    }

    const moduleTypeMap: Record<string, FeedbackType> = {
      feedback: 'FEEDBACK',
      reviews: 'REVIEW',
      bugReporting: 'BUG_REPORT',
      featureRequests: 'FEATURE_REQUEST',
    }

    for (const [moduleKey, enabled] of Object.entries(config.modules || {})) {
      if (enabled) {
        const feedbackType = moduleTypeMap[moduleKey]
        if (feedbackType) {
          return { type: 'active', feedbackType }
        }
      }
    }

    // Ultimate fallback
    return { type: 'active', feedbackType: 'FEEDBACK' }
  }, [config, externalState])

  const [internalState, setInternalState] = useState<WidgetState>(getInitialState)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentState = externalState || internalState

  const updateState = useCallback(
    (newState: WidgetState) => {
      if (onStateChange) {
        onStateChange(newState)
      } else {
        setInternalState(newState)
      }
    },
    [onStateChange]
  )

  // Handle success state with confetti
  useEffect(() => {
    if (currentState.type === 'success') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentState.type])

  // Get available feedback types
  const getAvailableFeedbackTypes = useCallback((): FeedbackType[] => {
    const types: FeedbackType[] = []

    const primaryType = config.primaryType
    const primaryModuleMap: Record<string, keyof typeof config.modules> = {
      FEEDBACK: 'feedback',
      SURVEY: 'feedback',
      NPS: 'feedback',
      CSAT: 'feedback',
      CES: 'feedback',
      REVIEW: 'reviews',
      BUG_REPORT: 'bugReporting',
      FEATURE_REQUEST: 'featureRequests',
    }

    const primaryModuleKey = primaryModuleMap[primaryType]
    if (primaryType && config.modules?.[primaryModuleKey]) {
      types.push(primaryType as FeedbackType)
    }

    const moduleTypeMap: Record<string, FeedbackType> = {
      feedback: 'FEEDBACK',
      reviews: 'REVIEW',
      bugReporting: 'BUG_REPORT',
      featureRequests: 'FEATURE_REQUEST',
    }

    Object.entries(config.modules || {}).forEach(([moduleKey, enabled]) => {
      if (enabled) {
        const feedbackType = moduleTypeMap[moduleKey]
        if (feedbackType && !types.includes(feedbackType)) {
          types.push(feedbackType)
        }
      }
    })

    return types
  }, [config])

  return {
    currentState,
    updateState,
    showConfetti,
    getAvailableFeedbackTypes,
    getInitialState,
  }
}
