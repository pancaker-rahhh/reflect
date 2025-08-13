import { useEffect, useState } from 'react'
import { feedbackApi } from '@/lib/api/feedback'

// Reusable Loading Components
const LoadingSpinner = ({
  size = 'md',
  color = '#6B46C1',
}: {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full animate-spin`}
        style={{ borderTopColor: color }}
      ></div>
      <div
        className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent rounded-full animate-ping`}
        style={{ borderTopColor: `${color}40` }}
      ></div>
    </div>
  )
}

const SkeletonPulse = ({ className }: { className: string }) => (
  <div
    className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className}`}
  ></div>
)

// Define the possible states for our widget's view
type WidgetView =
  | 'LOADING'
  | 'ERROR'
  | 'PRIMARY_SURVEY'
  | 'MENU'
  | 'BUG_REPORT'
  | 'FEATURE_REQUEST'
  | 'REVIEW'
  | 'SUCCESS'

// API function to get widget data
async function getWidgetData(key: string) {
  const isDevelopment =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'
  const response = await fetch(`${apiBaseUrl}/api/v1/public/widgets/${key}`)
  if (!response.ok) throw new Error('Failed to fetch widget configuration')
  return response.json()
}

export function WidgetView() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState<WidgetView>('LOADING')
  const [config, setConfig] = useState<any>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // UI interaction state (moved from render functions to fix hooks issue)
  const [hoveredScore, setHoveredScore] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)

  // Success confetti effect (moved from renderSuccess to fix hooks issue)
  useEffect(() => {
    if (view === 'SUCCESS') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [view])

  // --- DATA FETCHING ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key')
    if (!key) {
      setError('Public key is missing.')
      setView('ERROR')
      return
    }
    setPublicKey(key)
    getWidgetData(key)
      .then((data) => {
        setConfig(data)
        // Determine the initial view based on the primary survey type
        setView('PRIMARY_SURVEY')
      })
      .catch((err) => {
        console.error(err)
        setError('Could not load widget configuration.')
        setView('ERROR')
      })
  }, [])

  // --- SUBMISSION HANDLERS ---
  const handleScoreSubmission = async (score: number, type: string) => {
    if (!publicKey) return
    setSelectedRating(score)
    setIsSubmitting(true)

    try {
      await feedbackApi.submit({
        widgetKey: publicKey,
        response: `${type}: ${score}`,
        rating: score,
      })

      // Check if additional modules are enabled
      const hasAdditionalModules =
        modules.bugReporting || modules.featureRequests || modules.reviews
      if (hasAdditionalModules) {
        setView('MENU')
      } else {
        setView('SUCCESS')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextSubmission = async () => {
    if (!feedback.trim() || !publicKey) return
    setIsSubmitting(true)

    try {
      await feedbackApi.submit({
        widgetKey: publicKey,
        response: feedback,
      })

      // Check if additional modules are enabled
      const hasAdditionalModules =
        modules.bugReporting || modules.featureRequests || modules.reviews
      if (hasAdditionalModules) {
        setView('MENU')
      } else {
        setView('SUCCESS')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- DYNAMIC CONTENT & STYLES ---
  const theme = config?.theme_configuration || {}
  const content = config?.configuration?.content || {}
  const modules = config?.configuration?.modules || {}

  const primaryColor = theme.primary || '#6B46C1'
  const backgroundColor = theme.background || '#FFFFFF'
  const textColor = theme.text || '#1F2937'
  const buttonColor = theme.buttonColor || '#6B46C1'
  const buttonTextColor = theme.buttonTextColor || '#FFFFFF'

  const headerTitle = content.headerTitle || 'We value your feedback'
  const thankYouTitle = content.thankYouTitle || 'Thank you!'
  const thankYouMessage = content.thankYouMessage || 'Your feedback helps us improve.'

  // --- UI COMPONENTS ---

  const renderLoading = () => (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <SkeletonPulse className="mx-auto w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonPulse className="h-6 rounded-lg mx-auto w-3/4" />
          <SkeletonPulse className="h-4 rounded-lg mx-auto w-1/2" />
        </div>
      </div>

      {/* Survey skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-11 gap-2">
          {[...Array(11)].map((_, i) => (
            <SkeletonPulse
              key={i}
              className="aspect-square rounded-xl"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <SkeletonPulse className="h-3 rounded w-16" />
          <SkeletonPulse className="h-3 rounded w-20" />
        </div>
      </div>

      {/* Loading spinner */}
      <div className="flex justify-center">
        <LoadingSpinner size="lg" color="#3B82F6" />
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="text-sm text-gray-500 animate-pulse">Setting up your experience...</p>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="p-6 text-center space-y-4">
      {/* Error icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error message */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-red-600">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-600">
          {error || 'We encountered an issue loading the widget'}
        </p>
      </div>

      {/* Retry button */}
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>Try Again</span>
      </button>
    </div>
  )

  const renderSuccess = () => {
    return (
      <div className="p-8 text-center relative overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <span className="text-2xl">
                  {['🎉', '✨', '🎊', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Success Icon with Scale Animation */}
        <div className="mb-6">
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${adjustColorBrightness(
                primaryColor,
                -20
              )})`,
              boxShadow: `0 10px 30px ${primaryColor}40`,
            }}
          >
            <svg
              className="w-10 h-10 text-white animate-bounce"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Animated Title */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold animate-pulse" style={{ color: primaryColor }}>
            {thankYouTitle || '🎉 Thank You!'}
          </h3>

          <p className="text-lg opacity-80" style={{ color: textColor }}>
            {thankYouMessage || 'Your feedback helps us improve our service'}
          </p>
        </div>

        {/* Animated Quote/Message */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
          <p className="text-sm font-medium text-gray-600 italic">
            "Every piece of feedback brings us closer to perfection" ✨
          </p>
        </div>

        {/* Social Share Buttons (Optional) */}
        <div className="mt-6 flex justify-center space-x-3">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 border"
            style={{
              borderColor: primaryColor,
              color: primaryColor,
              backgroundColor: 'transparent',
            }}
            onClick={() => {
              // Optional: Add social sharing or feedback on feedback
              console.log('Share feedback experience')
            }}
          >
            💬 Share Experience
          </button>

          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: primaryColor,
              color: 'white',
            }}
            onClick={() => {
              // Close widget after success
              window.parent?.postMessage({ type: 'CLOSE_WIDGET' }, '*')
            }}
          >
            ✨ Done
          </button>
        </div>

        {/* Bottom Branding */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold">Reflect</span>
          </p>
        </div>
      </div>
    )
  }

  // Renders the primary survey (NPS/CES/CSAT)
  const renderPrimarySurvey = () => {
    const surveyType = config?.widget_type || 'csat'
    const mainQuestion = content.mainQuestion || getDefaultQuestion(surveyType)

    return (
      <div className="p-6">
        <div className="mb-6">
          <h3
            className="text-lg font-medium mb-2 text-center leading-tight"
            style={{ color: textColor }}
          >
            {mainQuestion}
          </h3>
        </div>

        {surveyType === 'nps' && renderNPSScale()}
        {(surveyType === 'csat' || surveyType === 'ces') && renderRatingScale()}
        {surveyType === 'feedback' && renderTextFeedback()}

        <div className="mt-4 text-center">
          <button
            onClick={() => setView('MENU')}
            className="text-sm underline opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: textColor }}
          >
            Skip this question
          </button>
        </div>
      </div>
    )
  }

  function getDefaultQuestion(type: string) {
    switch (type) {
      case 'nps':
        return 'How likely are you to recommend us to a friend or colleague?'
      case 'csat':
        return 'How satisfied are you with our service?'
      case 'ces':
        return 'How easy was it to use our service?'
      default:
        return 'How can we improve?'
    }
  }

  const renderNPSScale = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-11 gap-2 px-2">
          {[...Array(11)].map((_, i) => {
            const isHovered = hoveredScore === i
            const getScoreColor = (score: number) => {
              if (score <= 6) return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' } // Detractor - Amber
              if (score <= 8) return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' } // Passive - Amber
              return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' } // Promoter - Green
            }
            const colors = getScoreColor(i)

            return (
              <button
                key={i}
                onClick={() => handleScoreSubmission(i, 'nps')}
                onMouseEnter={() => setHoveredScore(i)}
                onMouseLeave={() => setHoveredScore(null)}
                className="aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-3 focus:ring-offset-2 active:scale-95 shadow-sm hover:shadow-lg"
                style={{
                  backgroundColor: isHovered ? colors.border : colors.bg,
                  color: isHovered ? 'white' : colors.text,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: colors.border,
                  boxShadow: isHovered
                    ? `0 8px 25px rgba(0,0,0,0.15)`
                    : '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {i}
              </button>
            )
          })}
        </div>
        <div className="flex justify-between text-sm font-medium px-4" style={{ color: textColor }}>
          <div className="text-center">
            <div className="text-xs opacity-60">Not likely</div>
            <div className="text-xs text-amber-600">😞 Detractors</div>
          </div>
          <div className="text-center">
            <div className="text-xs opacity-60">Very likely</div>
            <div className="text-xs text-green-600">😊 Promoters</div>
          </div>
        </div>
      </div>
    )
  }

  const renderRatingScale = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-center space-x-3">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isHovered = hoveredRating !== null && rating <= hoveredRating
            const isActive = hoveredRating === rating

            return (
              <button
                key={rating}
                onClick={() => handleScoreSubmission(rating, 'rating')}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all duration-300 transform hover:scale-125 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-110 relative"
                style={{
                  color: isHovered ? '#FBBF24' : '#E5E7EB',
                  filter: isHovered
                    ? 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))'
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transform: isActive ? 'scale(1.3) translateY(-8px) rotate(5deg)' : undefined,
                  zIndex: isActive ? 10 : 1,
                }}
              >
                ⭐{/* Glow effect for hovered stars */}
                {isHovered && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Dynamic rating labels */}
        <div className="text-center">
          <div className="text-sm font-medium" style={{ color: textColor }}>
            {hoveredRating ? (
              <span className="inline-flex items-center space-x-2">
                <span>{getRatingLabel(hoveredRating)}</span>
                <span className="text-xl">{getRatingEmoji(hoveredRating)}</span>
              </span>
            ) : (
              'Tap a star to rate'
            )}
          </div>
        </div>

        <div className="flex justify-between text-xs opacity-60 px-4" style={{ color: textColor }}>
          <span>😞 Poor</span>
          <span>🎉 Excellent</span>
        </div>
      </div>
    )
  }

  const getRatingLabel = (rating: number): string => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return labels[rating] || ''
  }

  const getRatingEmoji = (rating: number): string => {
    const emojis = ['', '😞', '😐', '🙂', '😊', '🎉']
    return emojis[rating] || ''
  }

  const renderTextFeedback = () => {
    const maxLength = 500
    const characterCount = feedback.length
    const isNearLimit = characterCount > maxLength * 0.8

    return (
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts... ✨"
            maxLength={maxLength}
            className="w-full h-28 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all duration-300 placeholder-gray-400"
            style={{
              borderColor: feedback.trim() ? primaryColor : '#E5E7EB',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(5px)',
              boxShadow: feedback.trim()
                ? `0 0 0 3px ${primaryColor}20`
                : '0 2px 4px rgba(0,0,0,0.05)',
            }}
          />

          {/* Character counter */}
          <div
            className="absolute bottom-3 right-3 text-xs font-medium"
            style={{
              color: isNearLimit ? '#EF4444' : '#9CA3AF',
            }}
          >
            {characterCount}/{maxLength}
          </div>

          {/* Focus indicator */}
          {feedback.trim() && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

        <button
          onClick={() => handleTextSubmission()}
          disabled={!feedback.trim() || isSubmitting}
          className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          style={{
            background:
              !feedback.trim() || isSubmitting
                ? '#E5E7EB'
                : `linear-gradient(135deg, ${buttonColor}, ${adjustColorBrightness(
                    buttonColor,
                    -10
                  )})`,
            color: !feedback.trim() || isSubmitting ? '#9CA3AF' : buttonTextColor,
            boxShadow:
              feedback.trim() && !isSubmitting
                ? `0 8px 25px ${buttonColor}40`
                : '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center space-x-2">
              <LoadingSpinner size="sm" color="currentColor" />
              <span>Submitting...</span>
            </span>
          ) : (
            content.submitButtonText || 'Submit Feedback ✨'
          )}
        </button>

        {/* Helpful hint */}
        <div className="text-center">
          <p className="text-xs opacity-60" style={{ color: textColor }}>
            💡 Be specific to help us improve
          </p>
        </div>
      </div>
    )
  }

  // Helper function for color adjustment (if not already defined)
  const adjustColorBrightness = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * amount)
    const R = (num >> 16) + amt
    const B = ((num >> 8) & 0x00ff) + amt
    const G = (num & 0x0000ff) + amt
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  // Renders the menu of other available feedback modules
  const renderMenu = () => {
    const availableModules = [
      modules.bugReporting && {
        key: 'bug',
        onClick: () => setView('BUG_REPORT'),
        icon: '🐛',
        title: 'Report Bug',
        description: 'Something not working?',
        color: '#EF4444',
        bgColor: '#FEF2F2',
      },
      modules.featureRequests && {
        key: 'feature',
        onClick: () => setView('FEATURE_REQUEST'),
        icon: '💡',
        title: 'Suggest Feature',
        description: 'Got an idea?',
        color: '#F59E0B',
        bgColor: '#FFFBEB',
      },
      modules.reviews && {
        key: 'review',
        onClick: () => setView('REVIEW'),
        icon: '⭐',
        title: 'Leave Review',
        description: 'Share experience',
        color: '#10B981',
        bgColor: '#F0FDF4',
      },
    ].filter(Boolean)

    return (
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-semibold" style={{ color: textColor }}>
            What else can we help with?
          </h3>
          <p className="text-sm opacity-70" style={{ color: textColor }}>
            Choose an option below to continue
          </p>
        </div>

        {/* Enhanced Grid Layout */}
        <div
          className={`grid gap-4 ${
            availableModules.length === 1
              ? 'grid-cols-1'
              : availableModules.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {availableModules.map((module, index) => (
            <EnhancedMenuButton
              key={module.key}
              onClick={module.onClick}
              icon={module.icon}
              title={module.title}
              description={module.description}
              color={module.color}
              bgColor={module.bgColor}
              index={index}
            />
          ))}
        </div>

        {/* Skip Section */}
        <div className="pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => setView('SUCCESS')}
            className="inline-flex items-center space-x-2 text-sm font-medium opacity-70 hover:opacity-100 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50"
            style={{ color: textColor }}
          >
            <span>✨</span>
            <span>I'm all set, thanks!</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="text-center">
          <div
            className="inline-flex items-center space-x-2 text-xs opacity-60"
            style={{ color: textColor }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Feedback submitted</span>
          </div>
        </div>
      </div>
    )
  }

  // A generic form for submitting text-based feedback (for bugs, features, etc.)
  const renderFeedbackForm = (type: 'Bug' | 'Feature' | 'Review') => {
    const placeholders = {
      Bug: 'Describe the issue you encountered...',
      Feature: 'What feature would you like to see?',
      Review: 'Share your experience...',
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!feedback.trim() || !publicKey) return
      setIsSubmitting(true)
      try {
        await feedbackApi.submit({
          widgetKey: publicKey,
          response: feedback,
          feedbackType: type.toLowerCase(),
        })
        setView('SUCCESS')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Submission failed')
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={() => setView('MENU')}
            className="flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity mb-4"
            style={{ color: textColor }}
          >
            ← Back to options
          </button>
          <h3 className="font-medium mb-2" style={{ color: textColor }}>
            {type === 'Bug'
              ? 'Report a Bug'
              : type === 'Feature'
                ? 'Suggest a Feature'
                : 'Leave a Review'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={placeholders[type]}
            className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              borderColor: '#E5E7EB',
              focusRingColor: primaryColor,
              backgroundColor: backgroundColor,
              color: textColor,
            }}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={!feedback.trim() || isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            {isSubmitting ? 'Submitting...' : `Submit ${type}`}
          </button>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
        </form>
      </div>
    )
  }

  // --- VIEW ROUTER ---
  const renderContent = () => {
    switch (view) {
      case 'LOADING':
        return renderLoading()
      case 'ERROR':
        return renderError()
      case 'PRIMARY_SURVEY':
        return renderPrimarySurvey()
      case 'MENU':
        return renderMenu()
      case 'BUG_REPORT':
        return renderFeedbackForm('Bug')
      case 'FEATURE_REQUEST':
        return renderFeedbackForm('Feature')
      case 'REVIEW':
        return renderFeedbackForm('Review')
      case 'SUCCESS':
        return renderSuccess()
      default:
        return renderError()
    }
  }

  const showBranding = config?.theme_configuration?.show_branding !== false
  const isGlassmorphism = theme.theme_name === 'glassmorphism' || theme.theme_name === 'glass'

  return (
    <div
      className={`flex flex-col h-full font-sans antialiased ${
        isGlassmorphism ? 'backdrop-blur-xl bg-white/10 border border-white/20' : ''
      }`}
      style={{
        backgroundColor: isGlassmorphism ? 'rgba(255, 255, 255, 0.1)' : backgroundColor,
        color: textColor,
        backdropFilter: isGlassmorphism ? 'blur(20px)' : undefined,
        boxShadow: isGlassmorphism
          ? '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : undefined,
      }}
    >
      {/* Header */}
      <div
        className={`p-4 text-center relative overflow-hidden ${
          isGlassmorphism ? 'backdrop-blur-lg' : ''
        }`}
        style={{
          background: isGlassmorphism
            ? `linear-gradient(135deg, ${primaryColor}80, ${
                theme.headerGradientEnd || primaryColor
              }60)`
            : theme.headerGradientEnd
              ? `linear-gradient(135deg, ${primaryColor} 0%, ${theme.headerGradientEnd} 100%)`
              : primaryColor,
          backdropFilter: isGlassmorphism ? 'blur(10px)' : undefined,
          borderBottom: isGlassmorphism ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
        }}
      >
        <h2
          className={`font-semibold relative z-10 ${
            isGlassmorphism ? 'text-white drop-shadow-lg' : 'text-white'
          }`}
        >
          {headerTitle}
        </h2>
        <div className={`absolute inset-0 ${isGlassmorphism ? 'bg-black/5' : 'bg-black/10'}`}></div>

        {/* Glassmorphism decorative elements */}
        {isGlassmorphism && (
          <>
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-grow overflow-auto ${isGlassmorphism ? 'backdrop-blur-sm' : ''}`}
        style={{
          backgroundColor: isGlassmorphism ? 'rgba(255, 255, 255, 0.05)' : undefined,
        }}
      >
        {renderContent()}
      </div>

      {/* Branding */}
      {showBranding && (
        <div
          className={`p-3 text-center text-xs border-t ${
            isGlassmorphism ? 'border-white/10 backdrop-blur-lg bg-white/5' : 'border-gray-100'
          }`}
          style={{
            color: textColor,
            backdropFilter: isGlassmorphism ? 'blur(10px)' : undefined,
          }}
        >
          <div className={`${isGlassmorphism ? 'opacity-80' : 'opacity-60'}`}>
            Powered by{' '}
            <a
              href="https://reflect.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium hover:opacity-80 transition-opacity ${
                isGlassmorphism ? 'drop-shadow-sm' : ''
              }`}
              style={{ color: primaryColor }}
            >
              Reflect
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced MenuButton component with animations and better styling
function EnhancedMenuButton({
  onClick,
  icon,
  title,
  description,
  color,
  bgColor,
  index,
}: {
  onClick: () => void
  icon: string
  title: string
  description: string
  color: string
  bgColor: string
  index: number
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 border-2 overflow-hidden"
      style={
        {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: '#E5E7EB',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          animationDelay: `${index * 100}ms`,
          '--hover-bg': bgColor,
          '--hover-border': color,
          '--hover-shadow': `0 10px 25px ${color}20, 0 4px 10px rgba(0,0,0,0.1)`,
        } as any
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = bgColor
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 10px 25px ${color}20, 0 4px 10px rgba(0,0,0,0.1)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      {/* Background gradient effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${bgColor}, ${color}10)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center space-x-4">
        {/* Icon with animation */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-base transition-colors duration-300 group-hover:text-current"
            style={{ color: '#1F2937' }}
          >
            {title}
          </div>
          <div
            className="text-sm mt-1 transition-colors duration-300 group-hover:text-current"
            style={{ color: '#6B7280' }}
          >
            {description}
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className="flex-shrink-0 transition-all duration-300 group-hover:translate-x-1"
          style={{ color: '#9CA3AF' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Ripple effect */}
      <div
        className="absolute inset-0 rounded-2xl animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />
    </button>
  )
}

// Legacy MenuButton component (keeping for compatibility)
function MenuButton({
  onClick,
  icon,
  title,
  description,
}: {
  onClick: () => void
  icon: string
  title: string
  description: string
}) {
  return (
    <EnhancedMenuButton
      onClick={onClick}
      icon={icon}
      title={title}
      description={description}
      color="#6B46C1"
      bgColor="#F3F4F6"
      index={0}
    />
  )
}
