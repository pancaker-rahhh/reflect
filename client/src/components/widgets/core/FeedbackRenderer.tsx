import React from 'react'
import { NPSRating } from '@/components/widgets/scoring/NPSRating'
import { CSATRating } from '@/components/widgets/scoring/CSATRating'
import { CESRating } from '@/components/widgets/scoring/CESRating'
import { ReviewForm } from '@/components/widgets/forms/ReviewForm'
import { BugReportForm } from '@/components/widgets/forms/BugReportForm'
import { FeatureRequestForm } from '@/components/widgets/forms/FeatureRequestForm'
import { PublicFeedbackDisplay } from './PublicFeedbackDisplay'
import { LoadingSpinner } from './LoadingSpinner'
import type {
  FeedbackType,
  FeedbackData,
  BugReportFeedbackData,
  FeatureRequestFeedbackData,
  ReviewFeedbackData,
  GeneralFeedbackData,
} from './types'

interface FeedbackRendererProps {
  feedbackType: FeedbackType
  selectedScore?: number
  isSubmitting: boolean
  onSubmit: (data: FeedbackData) => Promise<void>
  onScoreChange: (score: number) => Promise<void>
  colors: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
  content: {
    headerTitle: string
    mainQuestion: string
    submitButtonText: string
    thankYouTitle: string
    thankYouMessage: string
  }
  mode: 'preview' | 'production'
  widgetKey?: string
}

export function FeedbackRenderer({
  feedbackType,
  selectedScore,
  isSubmitting,
  onSubmit,
  onScoreChange,
  colors,
  content,
  mode,
  widgetKey,
}: FeedbackRendererProps) {
  const [additionalFeedback, setAdditionalFeedback] = React.useState('')

  const handleSubmit = async () => {
    if (selectedScore === undefined) return

    const response = `Rating: ${selectedScore}${
      additionalFeedback.trim() ? ` - ${additionalFeedback.trim()}` : ''
    }`

    await onSubmit({
      response,
      rating: selectedScore,
      feedbackType,
      typeSpecificData: {
        title: `${feedbackType} Feedback`,
        message: additionalFeedback.trim() || '',
      } as GeneralFeedbackData,
    })
  }

  const handleReviewSubmit = async (data: { rating: number; review?: string }) => {
    await onSubmit({
      response: `Rating: ${data.rating}/5${data.review ? ` - ${data.review}` : ''}`,
      rating: data.rating,
      feedbackType,
      typeSpecificData: {
        overall_rating: data.rating,
        pros: data.review || '',
        cons: '',
      } as ReviewFeedbackData,
    })
  }

  const handleBugReportSubmit = async (data: {
    title: string
    category: string
    severity: string
    description: string
    stepsToReproduce?: string
  }) => {
    const response = [
      `Title: ${data.title}`,
      `Category: ${data.category}`,
      `Severity: ${data.severity}`,
      `Description: ${data.description}`,
      data.stepsToReproduce ? `Steps: ${data.stepsToReproduce}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    await onSubmit({
      response,
      feedbackType,
      typeSpecificData: {
        title: data.title,
        severity: data.severity,
        steps_to_reproduce: data.stepsToReproduce || '',
        expected_result: '',
        actual_result: data.description,
        visual_proof: {},
      } as BugReportFeedbackData,
    })
  }

  const handleFeatureRequestSubmit = async (data: {
    title: string
    category: string
    priority: string
    description: string
    useCase: string
  }) => {
    const response = [
      `Title: ${data.title}`,
      `Category: ${data.category}`,
      `Priority: ${data.priority}`,
      `Description: ${data.description}`,
      `Use Case: ${data.useCase}`,
    ].join('\n')

    await onSubmit({
      response,
      feedbackType,
      typeSpecificData: {
        title: data.title,
        suggested_solution: data.description,
        benefits: `Priority: ${data.priority}, Category: ${data.category}`,
        use_case: data.useCase,
      } as FeatureRequestFeedbackData,
    })
  }

  const handleGeneralFeedbackSubmit = async (feedback: string) => {
    await onSubmit({
      response: feedback,
      feedbackType,
      typeSpecificData: {
        title: `${feedbackType} Feedback`,
        message: feedback,
      } as GeneralFeedbackData,
    })
  }

  switch (feedbackType) {
    case 'NPS':
      return (
        <div className="space-y-6">
          <NPSRating value={selectedScore} onChange={onScoreChange} disabled={isSubmitting} />
          {selectedScore !== undefined && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Share more details (optional)
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder="What specifically made you give this score? Your feedback helps us improve..."
                  className="w-full h-28 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all text-sm"
                  style={{
                    borderColor: additionalFeedback.trim() ? colors.primary : '#E5E7EB',
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: additionalFeedback.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
                  }}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
                  {additionalFeedback.length}/500
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.buttonColor, color: colors.buttonTextColor }}
              >
                {isSubmitting ? 'Submitting...' : content.submitButtonText}
              </button>
            </div>
          )}
        </div>
      )

    case 'CSAT':
      return (
        <div className="space-y-6">
          <CSATRating value={selectedScore} onChange={onScoreChange} disabled={isSubmitting} />
          {selectedScore !== undefined && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Share more details (optional)
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder="What specifically made you give this score? Your feedback helps us improve..."
                  className="w-full h-28 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all text-sm"
                  style={{
                    borderColor: additionalFeedback.trim() ? colors.primary : '#E5E7EB',
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: additionalFeedback.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
                  }}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
                  {additionalFeedback.length}/500
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.buttonColor, color: colors.buttonTextColor }}
              >
                {isSubmitting ? 'Submitting...' : content.submitButtonText}
              </button>
            </div>
          )}
        </div>
      )

    case 'CES':
      return (
        <div className="space-y-6">
          <CESRating value={selectedScore} onChange={onScoreChange} disabled={isSubmitting} />
          {selectedScore !== undefined && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Share more details (optional)
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder="What specifically made you give this score? Your feedback helps us improve..."
                  className="w-full h-28 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all text-sm"
                  style={{
                    borderColor: additionalFeedback.trim() ? colors.primary : '#E5E7EB',
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: additionalFeedback.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
                  }}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
                  {additionalFeedback.length}/500
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.buttonColor, color: colors.buttonTextColor }}
              >
                {isSubmitting ? 'Submitting...' : content.submitButtonText}
              </button>
            </div>
          )}
        </div>
      )

    case 'REVIEW':
      return (
        <ReviewForm
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmitting}
          colors={colors}
          content={content}
        />
      )

    case 'BUG_REPORT':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              Bug Reports
            </h3>
            <p className="text-sm opacity-70" style={{ color: colors.text }}>
              Track known issues and report new ones
            </p>
          </div>

          <PublicFeedbackDisplay
            feedbackType="BUG_REPORT"
            widgetKey={widgetKey || ''}
            colors={colors}
          />

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4 text-center" style={{ color: colors.text }}>
              Report a Bug
            </h4>
            <BugReportForm
              onSubmit={handleBugReportSubmit}
              isSubmitting={isSubmitting}
              colors={colors}
              content={content}
            />
          </div>
        </div>
      )

    case 'FEATURE_REQUEST':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              Feature Requests
            </h3>
            <p className="text-sm opacity-70" style={{ color: colors.text }}>
              See what features others are requesting and add your own
            </p>
          </div>

          <PublicFeedbackDisplay
            feedbackType="FEATURE_REQUEST"
            widgetKey={widgetKey || ''}
            colors={colors}
          />

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4 text-center" style={{ color: colors.text }}>
              Request a Feature
            </h4>
            <FeatureRequestForm
              onSubmit={handleFeatureRequestSubmit}
              onUpvote={async (_featureId) => {
                // Feature upvote functionality
              }}
              widgetKey={mode === 'production' ? widgetKey : undefined}
              isSubmitting={isSubmitting}
              colors={colors}
              content={content}
              showExistingFeatures={false}
            />
          </div>
        </div>
      )

    case 'FEEDBACK':
    case 'SURVEY':
      return (
        <GeneralFeedbackForm
          onSubmit={handleGeneralFeedbackSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={content.submitButtonText}
          colors={colors}
        />
      )

    default:
      console.warn('Unknown feedback type:', feedbackType)
      // Fallback to general feedback form for unknown types
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              {feedbackType === 'SURVEY' ? 'Survey' : 'Feedback'}
            </h3>
            <p className="text-sm opacity-70" style={{ color: colors.text }}>
              {content.mainQuestion}
            </p>
          </div>

          <GeneralFeedbackForm
            onSubmit={handleGeneralFeedbackSubmit}
            isSubmitting={isSubmitting}
            submitButtonText={content.submitButtonText}
            colors={colors}
          />
        </div>
      )
  }
}

// General feedback form component
interface GeneralFeedbackFormProps {
  onSubmit: (feedback: string) => Promise<void>
  isSubmitting: boolean
  submitButtonText: string
  colors: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
}

function GeneralFeedbackForm({
  onSubmit,
  isSubmitting,
  submitButtonText,
  colors,
}: GeneralFeedbackFormProps) {
  const [feedback, setFeedback] = React.useState('')

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    await onSubmit(feedback)
  }

  return (
    <div className="space-y-4">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us what you think..."
        className="w-full h-32 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all"
        style={{
          borderColor: feedback.trim() ? colors.primary : '#E5E7EB',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: feedback.trim() ? `0 0 0 3px ${colors.primary}20` : undefined,
        }}
        disabled={isSubmitting}
      />
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || isSubmitting}
        className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: colors.buttonColor, color: colors.buttonTextColor }}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center space-x-2">
            <LoadingSpinner size="sm" color="currentColor" />
            <span>Submitting...</span>
          </span>
        ) : (
          submitButtonText
        )}
      </button>
    </div>
  )
}
