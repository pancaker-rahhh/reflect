import { useEffect, useState } from 'react'
import { feedbackApi } from '@/lib/api/feedback'

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

  const renderLoading = () => <div className="p-4 text-center">Loading...</div>
  const renderError = () => <div className="p-4 text-center text-red-600">{error}</div>

  const renderSuccess = () => (
    <div className="p-6 text-center">
      <h3 className="text-xl font-semibold mb-2">{thankYouTitle}</h3>
      <p>{thankYouMessage}</p>
    </div>
  )

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

  const renderNPSScale = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-11 gap-1">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleScoreSubmission(i, 'nps')}
            className="aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: i <= 6 ? '#FEF3C7' : i <= 8 ? '#FEF3C7' : '#D1FAE5',
              color: i <= 6 ? '#92400E' : i <= 8 ? '#92400E' : '#065F46',
              focusRingColor: primaryColor,
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs opacity-70" style={{ color: textColor }}>
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  )

  const renderRatingScale = () => (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleScoreSubmission(rating, 'rating')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 focus:outline-none"
            style={{
              color: '#FCD34D',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            ⭐
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs opacity-70 px-2" style={{ color: textColor }}>
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  )

  const renderTextFeedback = () => (
    <div className="space-y-4">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us what you think..."
        className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
        style={{
          borderColor: '#E5E7EB',
          focusRingColor: primaryColor,
          backgroundColor: backgroundColor,
        }}
      />
      <button
        onClick={() => handleTextSubmission()}
        disabled={!feedback.trim() || isSubmitting}
        className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor,
        }}
      >
        {isSubmitting ? 'Submitting...' : content.submitButtonText || 'Submit Feedback'}
      </button>
    </div>
  )

  // Renders the menu of other available feedback modules
  const renderMenu = () => (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="font-medium mb-2" style={{ color: textColor }}>
          Anything else you'd like to share?
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Help us improve by providing additional feedback
        </p>
      </div>

      <div className="space-y-2">
        {modules.bugReporting && (
          <MenuButton
            onClick={() => setView('BUG_REPORT')}
            icon="🐛"
            title="Report a Bug"
            description="Found something that's not working?"
          />
        )}
        {modules.featureRequests && (
          <MenuButton
            onClick={() => setView('FEATURE_REQUEST')}
            icon="💡"
            title="Suggest a Feature"
            description="Have an idea for improvement?"
          />
        )}
        {modules.reviews && (
          <MenuButton
            onClick={() => setView('REVIEW')}
            icon="⭐"
            title="Leave a Review"
            description="Share your experience with others"
          />
        )}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => setView('SUCCESS')}
          className="w-full text-sm opacity-70 hover:opacity-100 transition-opacity py-2"
          style={{ color: textColor }}
        >
          No thanks, I'm done
        </button>
      </div>
    </div>
  )

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

  return (
    <div
      className="flex flex-col h-full font-sans antialiased"
      style={{ backgroundColor, color: textColor }}
    >
      {/* Header */}
      <div
        className="p-4 text-center relative overflow-hidden"
        style={{
          background: theme.headerGradientEnd
            ? `linear-gradient(135deg, ${primaryColor} 0%, ${theme.headerGradientEnd} 100%)`
            : primaryColor,
        }}
      >
        <h2 className="font-semibold text-white relative z-10">{headerTitle}</h2>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto">{renderContent()}</div>

      {/* Branding */}
      {showBranding && (
        <div
          className="p-3 text-center text-xs border-t border-gray-100"
          style={{ color: textColor }}
        >
          <div className="opacity-60">
            Powered by{' '}
            <a
              href="https://reflect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:opacity-80 transition-opacity"
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

// MenuButton component for the menu options
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
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm border border-gray-100 hover:border-gray-200"
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>
        <span className="text-gray-400 mt-1">→</span>
      </div>
    </button>
  )
}
