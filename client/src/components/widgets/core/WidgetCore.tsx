import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'
import { SkeletonPulse } from './SkeletonPulse'
import { FeedbackRenderer } from './FeedbackRenderer'
import { useWidgetState } from './useWidgetState'
import { useFeedbackSubmission } from './useFeedbackSubmission'
import type { WidgetCoreProps, FeedbackType } from './types'
import { FEEDBACK_TYPE_INFO } from './types'

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

export function WidgetCore({
  config,
  mode,
  state: externalState,
  onSubmit,
  onClose,
  onStateChange,
}: WidgetCoreProps) {
  // Use custom hooks for state management
  const { currentState, updateState, showConfetti, getAvailableFeedbackTypes } = useWidgetState({
    config,
    externalState,
    onStateChange,
  })



  // Use custom hook for feedback submission
  const { isSubmitting, error, errorInfo, handleSubmit, handleScoreSubmission, clearError } =
    useFeedbackSubmission({
      mode,
      onSubmit,
      onStateChange: updateState,
      getAvailableFeedbackTypes,
      onScoreRestore: setSelectedScore,
    })

  const [selectedScore, setSelectedScore] = useState<number | undefined>()
  const theme = config.appearance
  const content = config.content

  // Resolve content for a feedback type using per-type overrides when available
  function resolveContentFor(type: FeedbackType) {
    const overrides = config.contentByType?.[type] || {}
    return {
      headerTitle: overrides.headerTitle || content.headerTitle,
      mainQuestion: overrides.mainQuestion || content.mainQuestion,
      submitButtonText: overrides.submitButtonText || content.submitButtonText,
      thankYouTitle: overrides.thankYouTitle || content.thankYouTitle,
      thankYouMessage: overrides.thankYouMessage || content.thankYouMessage,
    }
  }

  const primaryColor = theme.colors.primary
  const backgroundColor = theme.colors.background
  const textColor = theme.colors.text
  // Always use primary color for buttons, ignore any configured buttonColor
  const buttonColor = primaryColor
  const buttonTextColor = '#ffffff'

  const colors = {
    ...theme.colors,
    buttonColor,
    buttonTextColor,
  }

  // Clear selected score when feedback type changes
  const activeFeedbackType = currentState.type === 'active' ? currentState.feedbackType : null
  React.useEffect(() => {
    setSelectedScore(undefined)
  }, [activeFeedbackType])

  const handleScoreChange = async (score: number) => {
    setSelectedScore(score)
    const currentFeedbackType =
      currentState.type === 'active' ? currentState.feedbackType : config.primaryType

    // For NPS, CSAT, and CES, just set the score and show textbox
    // For other types, submit immediately
    if (['NPS', 'CSAT', 'CES'].includes(currentFeedbackType)) {
      // Don't submit immediately, let the user add additional feedback
      return
    }

    await handleScoreSubmission(score, currentFeedbackType)
  }

  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
      <LoadingSpinner size="lg" color={primaryColor} />
      <div className="text-center">
        <div className="h-4 w-32 mb-2">
          <SkeletonPulse className="h-full w-full rounded" />
        </div>
        <div className="h-3 w-24">
          <SkeletonPulse className="h-full w-full rounded" />
        </div>
      </div>
    </div>
  )

  // Rate limiting countdown state
  const [timeLeft, setTimeLeft] = useState(errorInfo?.retryAfter || 0)

  React.useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Render rate limiting error with countdown
  const renderRateLimitError = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            Too Many Requests
          </h3>
          <p className="text-sm opacity-70 mt-1" style={{ color: textColor }}>
            {errorInfo?.message || 'Please wait before submitting again'}
          </p>
          {timeLeft > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-sm font-medium text-orange-800">
                Try again in: {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={clearError}
          disabled={timeLeft > 0}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            timeLeft > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'hover:shadow-lg'
          }`}
          style={{
            backgroundColor: timeLeft > 0 ? undefined : buttonColor,
            color: timeLeft > 0 ? undefined : buttonTextColor,
          }}
        >
          {timeLeft > 0 ? 'Please Wait' : 'Try Again'}
        </button>
      </div>
    )
  }

  // Render error state
  const renderError = () => {
    // Show special rate limiting UI if it's a rate limit error
    if (errorInfo?.type === 'rate_limit') {
      return renderRateLimitError()
    }

    // Default error UI for other errors
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            {errorInfo?.type === 'network'
              ? 'Connection Error'
              : errorInfo?.type === 'server'
                ? 'Server Error'
                : errorInfo?.type === 'validation'
                  ? 'Invalid Input'
                  : 'Something went wrong'}
          </h3>
          <p className="text-sm opacity-70 mt-1" style={{ color: textColor }}>
            {error || 'Please try again later'}
          </p>
        </div>
        <button
          onClick={clearError}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Render success state
  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 text-center">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti animation would go here */}
        </div>
      )}
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: textColor }}>
          {resolveContentFor(config.primaryType).thankYouTitle}
        </h3>
        <p className="text-sm opacity-70 mt-1" style={{ color: textColor }}>
          {resolveContentFor(config.primaryType).thankYouMessage}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {shouldShowBackToMenu() && (
          <button
            onClick={() =>
              updateState({ type: 'menu', availableTypes: getAvailableFeedbackTypes() })
            }
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg border-2"
            style={{
              backgroundColor: 'transparent',
              color: buttonColor,
              borderColor: buttonColor,
            }}
          >
            Provide More Feedback
          </button>
        )}
        <button
          onClick={() => {
            if (onClose) {
              onClose()
            } else {
              updateState({ type: 'closed' })
            }
          }}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          Close
        </button>
      </div>
    </div>
  )

  // Render menu state
  const renderMenu = () => {
    const availableTypes = getAvailableFeedbackTypes()

    // Use button color for all modules instead of hardcoded colors
    const buttonColorRgb = hexToRgb(buttonColor)
    const buttonColorLight = `rgba(${buttonColorRgb.r}, ${buttonColorRgb.g}, ${buttonColorRgb.b}, 0.1)`
    const buttonColorMedium = `rgba(${buttonColorRgb.r}, ${buttonColorRgb.g}, ${buttonColorRgb.b}, 0.2)`

    const availableModules = availableTypes.map((feedbackType) => {
      const info = FEEDBACK_TYPE_INFO[feedbackType]

      return {
        ...info,
        color: {
          bg: buttonColorLight,
          border: buttonColor,
          icon: buttonColor,
        },
      }
    })

    return (
      <div className="px-6 pt-4 pb-6 space-y-6">
        <div className="text-center">
          <p className="text-xs opacity-70" style={{ color: textColor }}>
            Choose what you&apos;d like to share with us
          </p>
        </div>

        <div className="space-y-2">
          {availableModules.map((module) => (
            <button
              key={module.type}
              onClick={() => updateState({ type: 'active', feedbackType: module.type })}
              className="w-full text-left p-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border-2 group"
              style={{
                backgroundColor: module.color.bg,
                borderColor: module.color.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = module.color.icon
                e.currentTarget.style.backgroundColor = buttonColorMedium
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = module.color.border
                e.currentTarget.style.backgroundColor = module.color.bg
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${module.color.icon}15`, color: module.color.icon }}
                >
                  {module.icon}
                </div>
                <div className="flex-1">
                  <div
                    className="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200"
                    style={{ color: textColor }}
                  >
                    {module.title}
                  </div>
                  <div className="text-xs opacity-70 mt-0.5" style={{ color: textColor }}>
                    {module.description}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Check if we should show the back to menu button
  const shouldShowBackToMenu = () => {
    const availableTypes = getAvailableFeedbackTypes()
    return availableTypes.length > 1
  }

  // Render content based on state
  const renderContent = () => {
    switch (currentState.type) {
      case 'loading':
        return renderLoading()
      case 'error':
        return renderError()
      case 'menu':
        return renderMenu()
      case 'active':
        return (
          <div className="px-4 pt-2 pb-4 space-y-4">
            {/* Back button - only show if multiple modules are enabled */}
            {shouldShowBackToMenu() && (
              <div className="flex items-center mb-2">
                <button
                  onClick={() =>
                    updateState({ type: 'menu', availableTypes: getAvailableFeedbackTypes() })
                  }
                  className="flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity duration-200"
                  style={{ color: textColor }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2"
                  >
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  Back to menu
                </button>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm opacity-70" style={{ color: textColor }}>
                {resolveContentFor(currentState.feedbackType).mainQuestion}
              </p>
            </div>

            <FeedbackRenderer
              key={currentState.feedbackType}
              feedbackType={currentState.feedbackType}
              selectedScore={selectedScore}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onScoreChange={handleScoreChange}
              colors={colors}
              content={resolveContentFor(currentState.feedbackType)}
              mode={mode}
              widgetKey={config.widgetKey}
            />
          </div>
        )
      case 'success':
        return renderSuccess()
      case 'closed':
        return null
      default:
        return renderError()
    }
  }

  const isGlassmorphism = theme.theme === 'minimal-light' || theme.theme === 'minimal-dark'

  return (
    <div
      className={cn(
        'flex flex-col h-full font-sans antialiased relative rounded-2xl overflow-hidden',
        isGlassmorphism && 'backdrop-blur-xl border border-white/20'
      )}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        backdropFilter: isGlassmorphism ? 'blur(20px)' : undefined,
      }}
    >
      {/* Header */}
      <div
        className="p-3 text-center relative overflow-hidden"
        style={{
          background: theme.colors.headerGradientEnd
            ? `linear-gradient(135deg, ${primaryColor} 0%, ${theme.colors.headerGradientEnd} 100%)`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-white m-0">
            {
              resolveContentFor(
                currentState.type === 'active' ? currentState.feedbackType : config.primaryType
              ).headerTitle
            }
          </h2>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            if (onClose) {
              onClose()
            } else {
              updateState({ type: 'closed' })
            }
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center z-50 cursor-pointer"
          style={{ zIndex: 9999 }}
          title="Close widget"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {renderContent()}
      </div>

      {/* Branding */}
      {theme.showBranding && (
        <div className="p-3 text-center border-t border-gray-200/20">
          <div className="text-xs opacity-50" style={{ color: textColor }}>
            Powered by{' '}
            <a
              href="https://reflectfeedback.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-75 transition-opacity"
            >
              Reflect
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
