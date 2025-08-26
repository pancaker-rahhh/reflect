import { useState, useEffect } from 'preact/hooks'
import { NPSRating } from '@/components/widgets/scoring/NPSRating'
import { CSATRating } from '@/components/widgets/scoring/CSATRating'
import { CESRating } from '@/components/widgets/scoring/CESRating'
import { ReviewForm } from '@/components/widgets/forms/ReviewForm'
import { BugReportForm } from '@/components/widgets/forms/BugReportForm'
import { FeatureRequestForm } from '@/components/widgets/forms/FeatureRequestForm'
import { cn } from '@/lib/utils'
import type {
  WidgetCoreProps,
  WidgetState,
  FeedbackType,
  FeedbackData,
  WidgetConfiguration,
} from './types'
import { FEEDBACK_TYPE_INFO } from './types'

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

export function WidgetCore({ 
  config, 
  mode, 
  state: externalState,
  onSubmit, 
  onClose, 
  onStateChange 
}: WidgetCoreProps) {
  const getInitialState = (): WidgetState => {
    if (externalState) return externalState
    
    // Build available types based on enabled modules
    const availableTypes: FeedbackType[] = []
    
    // Always add the primary type first if it's enabled
    const primaryType = config.primaryType || 'FEEDBACK'
    const primaryModuleMap: Record<string, string> = {
      'FEEDBACK': 'feedback',
      'NPS': 'feedback', 
      'CSAT': 'feedback',
      'CES': 'feedback',
      'SURVEY': 'feedback',
      'REVIEW': 'reviews',
      'BUG_REPORT': 'bugReporting',
      'FEATURE_REQUEST': 'featureRequests'
    }
    
    const primaryModuleKey = primaryModuleMap[primaryType]
    if (config.modules?.[primaryModuleKey]) {
      availableTypes.push(primaryType as FeedbackType)
    }
    
    // Add other enabled modules (except primary type)
    const moduleTypeMap: Record<string, FeedbackType> = {
      'feedback': 'FEEDBACK',
      'reviews': 'REVIEW',
      'bugReporting': 'BUG_REPORT', 
      'featureRequests': 'FEATURE_REQUEST'
    }
    
    Object.entries(config.modules || {}).forEach(([moduleKey, enabled]) => {
      if (enabled && moduleKey !== primaryModuleKey) {
        const feedbackType = moduleTypeMap[moduleKey]
        if (feedbackType && !availableTypes.includes(feedbackType)) {
          availableTypes.push(feedbackType)
        }
      }
    })
    
    
    // Show menu if we have multiple options, otherwise go directly to the form
    if (availableTypes.length > 1) {
      return { type: 'menu', availableTypes }
    } else if (availableTypes.length === 1) {
      return { type: 'active', feedbackType: availableTypes[0] }
    }
    
    return { type: 'closed' }
  }

  const [internalState, setInternalState] = useState<WidgetState>(getInitialState())
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedScore, setSelectedScore] = useState<number | undefined>()
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoveredScore, setHoveredScore] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentState = externalState || internalState
  
  const updateState = (newState: WidgetState) => {
    if (onStateChange) {
      onStateChange(newState)
    } else {
      setInternalState(newState)
    }
  }

  useEffect(() => {
    if (currentState.type === 'success') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentState.type])

  const theme = config.appearance
  const content = config.content
  const modules = config.modules

  const primaryColor = theme.colors.primary
  const backgroundColor = theme.colors.background
  const textColor = theme.colors.text
  const buttonColor = theme.colors.buttonColor
  const buttonTextColor = theme.colors.buttonTextColor

  const getAvailableFeedbackTypes = (): FeedbackType[] => {
    const types: FeedbackType[] = []
    if (modules.feedback) types.push('FEEDBACK')
    if (modules.reviews) types.push('REVIEW')
    if (modules.bugReporting) types.push('BUG_REPORT')
    if (modules.featureRequests) types.push('FEATURE_REQUEST')
    return types
  }

  const validateFeedbackData = (data: FeedbackData): string | null => {
    // Basic validation
    if (!data.response || !data.response.trim()) {
      return 'Feedback message is required'
    }
    
    if (data.response.length > 5000) {
      return 'Feedback message is too long (maximum 5000 characters)'
    }
    
    // Type-specific validation
    if (data.typeSpecificData) {
      const typeData = data.typeSpecificData
      
      if (data.feedbackType === 'REVIEW' && data.rating && (data.rating < 1 || data.rating > 5)) {
        return 'Rating must be between 1 and 5 stars'
      }
      
      if (data.feedbackType === 'NPS' && typeData.nps_score && (typeData.nps_score < 0 || typeData.nps_score > 10)) {
        return 'NPS score must be between 0 and 10'
      }
      
      if ((data.feedbackType === 'CSAT' || data.feedbackType === 'CES') && typeData.score && (typeData.score < 1 || typeData.score > 5)) {
        return 'Score must be between 1 and 5'
      }
      
      if (data.feedbackType === 'BUG_REPORT' && typeData.title && !typeData.title.trim()) {
        return 'Bug title is required'
      }
      
      if (data.feedbackType === 'FEATURE_REQUEST' && typeData.title && !typeData.title.trim()) {
        return 'Feature title is required'
      }
    }
    
    return null // No validation errors
  }

  const handleSubmit = async (data: FeedbackData) => {
    // Client-side validation
    const validationError = validateFeedbackData(data)
    if (validationError) {
      setError(validationError)
      updateState({ type: 'error', message: validationError })
      return
    }
    if (mode === 'preview') {
      setIsSubmitting(true)
      setTimeout(() => {
        setIsSubmitting(false)
        const availableTypes = getAvailableFeedbackTypes()
        if (availableTypes.length > 1) {
          updateState({ type: 'menu', availableTypes })
        } else {
          updateState({ type: 'success' })
        }
      }, 1000)
    } else {
      if (onSubmit) {
        try {
          setIsSubmitting(true)
          await onSubmit(data)
          const availableTypes = getAvailableFeedbackTypes()
          if (availableTypes.length > 1) {
            updateState({ type: 'menu', availableTypes })
          } else {
            updateState({ type: 'success' })
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Submission failed')
          updateState({ type: 'error', message: error || 'Submission failed' })
        } finally {
          setIsSubmitting(false)
        }
      }
    }
  }

  const handleScoreSubmission = async (score: number) => {
    setSelectedScore(score)
    const type = config.primaryType.toLowerCase()
    
    // Prepare type-specific data for score-based feedback
    const typeSpecificData: any = {
      score: score,
      comment: '', // Could be extended to collect comments
    }
    
    // Add type-specific fields based on feedback type
    if (config.primaryType === 'NPS') {
      typeSpecificData.nps_score = score
      if (score >= 9) {
        typeSpecificData.promoter_category = 'promoter'
      } else if (score >= 7) {
        typeSpecificData.promoter_category = 'passive'
      } else {
        typeSpecificData.promoter_category = 'detractor'
      }
      typeSpecificData.follow_up_comment = ''
    } else if (config.primaryType === 'CSAT') {
      typeSpecificData.csat_score = score
      const levels = ['', 'very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied']
      typeSpecificData.satisfaction_level = levels[score] || 'neutral'
      typeSpecificData.follow_up_comment = ''
    } else if (config.primaryType === 'CES') {
      typeSpecificData.ces_score = score
      const levels = ['', 'very_difficult', 'difficult', 'neutral', 'easy', 'very_easy']
      typeSpecificData.ease_level = levels[score] || 'neutral'
      typeSpecificData.follow_up_comment = ''
    }
    
    await handleSubmit({
      response: `${type}: ${score}`,
      rating: score,
      feedbackType: config.primaryType,
      typeSpecificData,
    })
  }

  const handleTextSubmission = async () => {
    if (!feedback.trim()) return
    await handleSubmit({
      response: feedback,
      feedbackType: config.primaryType,
      typeSpecificData: {
        title: 'General Feedback',
        message: feedback,
      }
    })
  }

  const handleFeedbackFormSubmit = async (feedbackType: FeedbackType) => {
    if (!feedback.trim()) return
    await handleSubmit({
      response: feedback,
      feedbackType,
      typeSpecificData: {
        title: `${feedbackType} Feedback`,
        message: feedback,
      }
    })
  }

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

  const renderLoading = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-3">
        <SkeletonPulse className="mx-auto w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonPulse className="h-6 rounded-lg mx-auto w-3/4" />
          <SkeletonPulse className="h-4 rounded-lg mx-auto w-1/2" />
        </div>
      </div>
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
      </div>
      <div className="flex justify-center">
        <LoadingSpinner size="lg" color="#3B82F6" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500 animate-pulse">Setting up your experience...</p>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="p-6 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-red-600">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-600">
          {currentState.type === 'error' ? currentState.message : 'We encountered an issue'}
        </p>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="p-8 text-center relative overflow-hidden">
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
      
      <div className="mb-6">
        <div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColorBrightness(primaryColor, -20)})`,
            boxShadow: `0 10px 30px ${primaryColor}40`,
          }}
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold animate-pulse" style={{ color: primaryColor }}>
          {content.thankYouTitle}
        </h3>
        <p className="text-lg opacity-80" style={{ color: textColor }}>
          {content.thankYouMessage}
        </p>
      </div>

      {theme.showBranding && (
        <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
          Powered by Reflect
        </div>
      )}
    </div>
  )

  const renderPrimarySurvey = () => {
    const renderScoringComponent = () => {
      switch (config.primaryType) {
        case 'NPS':
          return (
            <NPSRating
              value={selectedScore}
              onChange={handleScoreSubmission}
              disabled={isSubmitting}
            />
          )
        case 'CSAT':
          return (
            <CSATRating
              value={selectedScore}
              onChange={handleScoreSubmission}
              disabled={isSubmitting}
            />
          )
        case 'CES':
          return (
            <CESRating
              value={selectedScore}
              onChange={handleScoreSubmission}
              disabled={isSubmitting}
            />
          )
        case 'REVIEW':
          return (
            <ReviewForm
              onSubmit={async (data) => {
                await handleSubmit({
                  response: `Rating: ${data.rating}/5${data.review ? ` - ${data.review}` : ''}`,
                  rating: data.rating,
                  feedbackType: config.primaryType,
                  typeSpecificData: {
                    overall_rating: data.rating,
                    pros: data.review || '',
                    cons: '', // ReviewForm doesn't collect cons separately
                  }
                })
              }}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        case 'BUG_REPORT':
          return (
            <BugReportForm
              onSubmit={async (data) => {
                const response = [
                  `Title: ${data.title}`,
                  `Category: ${data.category}`,
                  `Severity: ${data.severity}`,
                  `Description: ${data.description}`,
                  data.stepsToReproduce ? `Steps: ${data.stepsToReproduce}` : null
                ].filter(Boolean).join('\n')
                
                await handleSubmit({
                  response,
                  feedbackType: config.primaryType,
                  typeSpecificData: {
                    title: data.title,
                    severity: data.severity,
                    steps_to_reproduce: data.stepsToReproduce || '',
                    expected_result: '', // BugReportForm doesn't collect this
                    actual_result: data.description,
                    visual_proof: {},
                  }
                })
              }}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        case 'FEATURE_REQUEST':
          return (
            <FeatureRequestForm
              onSubmit={async (data) => {
                const response = [
                  `Title: ${data.title}`,
                  `Category: ${data.category}`,
                  `Priority: ${data.priority}`,
                  `Description: ${data.description}`,
                  `Use Case: ${data.useCase}`
                ].join('\n')
                
                await handleSubmit({
                  response,
                  feedbackType: config.primaryType,
                  typeSpecificData: {
                    title: data.title,
                    suggested_solution: data.description, // Use description as solution
                    benefits: `Priority: ${data.priority}, Category: ${data.category}`,
                    use_case: data.useCase,
                  }
                })
              }}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        default:
          return (
            <div className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full h-32 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all"
                style={{
                  borderColor: feedback.trim() ? primaryColor : '#E5E7EB',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: feedback.trim() ? `0 0 0 3px ${primaryColor}20` : undefined,
                }}
                disabled={isSubmitting}
              />
              <button
                onClick={handleTextSubmission}
                disabled={!feedback.trim() || isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center space-x-2">
                    <LoadingSpinner size="sm" color="currentColor" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  content.submitButtonText
                )}
              </button>
            </div>
          )
      }
    }

    return (
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-medium mb-2 text-center leading-tight" style={{ color: textColor }}>
            {content.mainQuestion}
          </h3>
        </div>
        {renderScoringComponent()}
      </div>
    )
  }

  const renderMenu = () => {
    if (currentState.type !== 'menu') return null

    const availableModules = currentState.availableTypes.map((type, index) => {
      const info = FEEDBACK_TYPE_INFO[type]
      const colors = {
        'FEEDBACK': { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1' },
        'NPS': { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1' },
        'CSAT': { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1' },
        'CES': { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1' },
        'SURVEY': { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1' },
        'REVIEW': { bg: '#FEF3C7', border: '#FDE68A', icon: '#F59E0B' },
        'BUG_REPORT': { bg: '#FEE2E2', border: '#FECACA', icon: '#EF4444' },
        'FEATURE_REQUEST': { bg: '#D1FAE5', border: '#A7F3D0', icon: '#10B981' },
      }
      
      // Override title for primary type (first in array)
      let title = info.title
      if (index === 0) {
        // Use primary type specific titles
        const primaryTitles: Record<string, string> = {
          'FEEDBACK': 'Give Feedback',
          'NPS': 'Rate Us (NPS)',
          'CSAT': 'Rate Satisfaction',
          'CES': 'Rate Experience',
          'SURVEY': 'Take Survey',
          'REVIEW': 'Write Review',
          'BUG_REPORT': 'Report Issue',
          'FEATURE_REQUEST': 'Suggest Feature'
        }
        title = primaryTitles[type] || title
      }
      
      return {
        type,
        title,
        description: info.description,
        icon: info.icon,
        color: colors[type as keyof typeof colors] || colors.FEEDBACK,
        isPrimary: index === 0
      }
    })

    return (
      <div className="p-5 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${primaryColor}15`, border: `2px solid ${primaryColor}30` }}>
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: textColor }}>
              How can we help you today?
            </h3>
            <p className="text-xs opacity-70" style={{ color: textColor }}>
              Choose what you'd like to share with us
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {availableModules.map((module, index) => (
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
                e.currentTarget.style.backgroundColor = `${module.color.bg}CC`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = module.color.border
                e.currentTarget.style.backgroundColor = module.color.bg
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                     style={{ backgroundColor: `${module.color.icon}15`, color: module.color.icon }}>
                  {module.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200" 
                       style={{ color: textColor }}>
                    {module.title}
                  </div>
                  <div className="text-xs opacity-70 mt-0.5" style={{ color: textColor }}>
                    {module.description}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  const renderFeedbackForm = () => {
    if (currentState.type !== 'active') return null

    const feedbackType = currentState.feedbackType
    const info = FEEDBACK_TYPE_INFO[feedbackType]

    const handleSpecificFormSubmit = async (data: any) => {
      await handleSubmit({
        response: typeof data === 'string' ? data : JSON.stringify(data),
        rating: data.rating,
        feedbackType,
      })
    }

    const renderTypeSpecificForm = () => {
      switch (feedbackType) {
        case 'REVIEW':
          return (
            <ReviewForm
              onSubmit={async (data) => {
                await handleSubmit({
                  response: `Rating: ${data.rating}/5${data.review ? ` - ${data.review}` : ''}`,
                  rating: data.rating,
                  feedbackType,
                  typeSpecificData: {
                    overall_rating: data.rating,
                    pros: data.review || '',
                    cons: '',
                  }
                })
              }}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        case 'BUG_REPORT':
          return (
            <BugReportForm
              onSubmit={async (data) => {
                const response = [
                  `Title: ${data.title}`,
                  `Category: ${data.category}`,
                  `Severity: ${data.severity}`,
                  `Description: ${data.description}`,
                  data.stepsToReproduce ? `Steps: ${data.stepsToReproduce}` : null
                ].filter(Boolean).join('\n')
                
                await handleSubmit({
                  response,
                  feedbackType,
                  typeSpecificData: {
                    title: data.title,
                    severity: data.severity,
                    steps_to_reproduce: data.stepsToReproduce || '',
                    expected_result: '',
                    actual_result: data.description,
                    visual_proof: {},
                  }
                })
              }}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        case 'FEATURE_REQUEST':
          return (
            <FeatureRequestForm
              onSubmit={async (data) => {
                const response = [
                  `Title: ${data.title}`,
                  `Category: ${data.category}`,
                  `Priority: ${data.priority}`,
                  `Description: ${data.description}`,
                  `Use Case: ${data.useCase}`
                ].join('\n')
                
                await handleSubmit({
                  response,
                  feedbackType,
                  typeSpecificData: {
                    title: data.title,
                    suggested_solution: data.description,
                    benefits: `Priority: ${data.priority}, Category: ${data.category}`,
                    use_case: data.useCase,
                  }
                })
              }}
              onUpvote={async (featureId) => {
                // Handle upvote functionality - will need API endpoint
                console.log('Upvote feature:', featureId)
              }}
              widgetKey={mode === 'production' ? (config as any).widgetKey : undefined}
              isSubmitting={isSubmitting}
              colors={theme.colors}
              content={content}
            />
          )
        default:
          // Default text input for FEEDBACK and other types
          const placeholders = {
            BUG_REPORT: 'Describe the issue you encountered...',
            FEATURE_REQUEST: 'What feature would you like to see?',
            REVIEW: 'Share your experience...',
            FEEDBACK: 'Tell us what you think...',
          }

          return (
            <div className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={placeholders[feedbackType as keyof typeof placeholders] || placeholders.FEEDBACK}
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
                disabled={isSubmitting}
              />

              <button
                onClick={() => handleFeedbackFormSubmit(feedbackType)}
                disabled={!feedback.trim() || isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${info.title}`}
              </button>
            </div>
          )
      }
    }

    return (
      <div className="p-5">
        <div className="mb-3">
          <button
            onClick={() => {
              const availableTypes = getAvailableFeedbackTypes()
              updateState({ type: 'menu', availableTypes })
            }}
            className="flex items-center text-xs opacity-70 hover:opacity-100 transition-opacity mb-3"
            style={{ color: textColor }}
          >
            ← Back to options
          </button>
          <h3 className="font-medium mb-2 text-sm" style={{ color: textColor }}>
            {info.title}
          </h3>
        </div>

        {renderTypeSpecificForm()}

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}
      </div>
    )
  }

  const renderContent = () => {
    switch (currentState.type) {
      case 'loading':
        return renderLoading()
      case 'error':
        return renderError()
      case 'closed':
        return renderPrimarySurvey()
      case 'menu':
        return renderMenu()
      case 'active':
        return renderFeedbackForm()
      case 'success':
        return renderSuccess()
      default:
        return renderError()
    }
  }

  const isGlassmorphism = theme.theme === 'minimal-light' || theme.theme === 'minimal-dark'

  return (
    <div
      className={cn(
        'flex flex-col h-full font-sans antialiased relative',
        isGlassmorphism && 'backdrop-blur-xl bg-white/10 border border-white/20'
      )}
      style={{
        backgroundColor: isGlassmorphism ? 'rgba(255, 255, 255, 0.1)' : backgroundColor,
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
            : primaryColor,
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-white flex-1 text-center text-sm">
            {content.headerTitle}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors ml-2"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto">
        {renderContent()}
      </div>

      {/* Branding */}
      {theme.showBranding && (
        <div className="p-2 text-center text-xs border-t border-gray-100">
          <div className="opacity-60" style={{ color: textColor }}>
            Powered by{' '}
            <span className="font-medium" style={{ color: primaryColor }}>
              Reflect
            </span>
          </div>
        </div>
      )}
    </div>
  )
}