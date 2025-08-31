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

    // Build available types based on enabled modules
    const availableTypes: FeedbackType[] = []

    // Always add the primary type first
    const primaryType = config.primaryType || 'FEEDBACK'

    // For scoring types (NPS, CSAT, CES), they should be directly available
    if (['NPS', 'CSAT', 'CES'].includes(primaryType)) {
      // Scoring types should be shown directly, not as part of menu system
      return { type: 'active', feedbackType: primaryType as FeedbackType }
    }

    // Handle other types with their module mapping
    const primaryModuleMap: Record<string, keyof typeof config.modules> = {
      FEEDBACK: 'feedback',
      SURVEY: 'feedback',
      REVIEW: 'reviews',
      BUG_REPORT: 'bugReporting',
      FEATURE_REQUEST: 'featureRequests',
    }

    const primaryModuleKey = primaryModuleMap[primaryType]
    if (config.modules?.[primaryModuleKey]) {
      availableTypes.push(primaryType as FeedbackType)
    }

    // Add other enabled modules (except primary type)
    const moduleTypeMap: Record<string, FeedbackType> = {
      feedback: 'FEEDBACK',
      reviews: 'REVIEW',
      bugReporting: 'BUG_REPORT',
      featureRequests: 'FEATURE_REQUEST',
    }

    Object.entries(config.modules || {}).forEach(([moduleKey, enabled]) => {
      if (enabled) {
        const feedbackType = moduleTypeMap[moduleKey]
        if (feedbackType && !availableTypes.includes(feedbackType)) {
          availableTypes.push(feedbackType)
        }
      }
    })

    // Simple logic: Show menu if multiple types, otherwise show the single type
    if (availableTypes.length > 1) {
      return { type: 'menu', availableTypes }
    } else if (availableTypes.length === 1) {
      return { type: 'active', feedbackType: availableTypes[0] }
    }

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

    // Check if we have a primary type that's a scoring type
    const primaryType = config.primaryType
    if (primaryType && ['NPS', 'CSAT', 'CES'].includes(primaryType)) {
      types.push(primaryType as FeedbackType)
    }

    // Add other module types
    if (config.modules.feedback) types.push('FEEDBACK')
    if (config.modules.reviews) types.push('REVIEW')
    if (config.modules.bugReporting) types.push('BUG_REPORT')
    if (config.modules.featureRequests) types.push('FEATURE_REQUEST')

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
