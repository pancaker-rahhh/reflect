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

// Get relevant placeholder text for each feedback type
function getPlaceholderText(feedbackType: FeedbackType): string {
  switch (feedbackType) {
    case 'NPS':
      return 'What specifically made you give this score? What would make you more likely to recommend us?'
    case 'CSAT':
      return 'What specifically made you give this score? What could we do to improve your satisfaction?'
    case 'CES':
      return 'What specifically made you give this score? What made it easy or difficult to get help?'
    case 'REVIEW':
      return 'Share your detailed experience with our service. What did you like or dislike?'
    case 'BUG_REPORT':
      return 'Describe the bug you encountered. What were you trying to do when it happened? Include steps to reproduce if possible.'
    case 'FEATURE_REQUEST':
      return "Describe the feature you'd like to see. How would it help you or improve your experience?"
    case 'FEEDBACK':
      return 'Share your thoughts, suggestions, or concerns. What can we do better?'
    case 'SURVEY':
      return 'Please share your thoughts and help us understand your needs better.'
    default:
      return 'Tell us what you think... Share your thoughts, suggestions, or concerns.'
  }
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

    // Only include rating in response if no additional feedback provided
    const response = additionalFeedback.trim()
      ? additionalFeedback.trim()
      : `Rating: ${selectedScore}`

    await onSubmit({
      response,
      rating: selectedScore,
      feedbackType,
      typeSpecificData: {
        title: feedbackType === 'FEEDBACK' ? 'General Feedback' : `${feedbackType} Feedback`,
        message: additionalFeedback.trim() || '',
      } as GeneralFeedbackData,
    })
  }

  const handleReviewSubmit = async (data: { rating: number; review?: string }) => {
    const response =
      data.review && data.review.trim() ? data.review.trim() : `Rating: ${data.rating}/5`

    await onSubmit({
      response,
      rating: data.rating,
      feedbackType,
      typeSpecificData: {
        overall_rating: data.rating,
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
    await onSubmit({
      response: data.description,
      feedbackType,
      typeSpecificData: {
        title: data.title,
        severity: data.severity,
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
    await onSubmit({
      response: data.description,
      feedbackType,
      typeSpecificData: {
        title: data.title,
      } as FeatureRequestFeedbackData,
    })
  }

  const handleGeneralFeedbackSubmit = async (feedback: string) => {
    await onSubmit({
      response: feedback,
      feedbackType,
      typeSpecificData: {
        title: feedbackType === 'FEEDBACK' ? 'General Feedback' : `${feedbackType} Feedback`,
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
                  placeholder={getPlaceholderText(feedbackType)}
                  className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
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
                    <span>Submitting...</span>
                  </div>
                ) : (
                  content.submitButtonText
                )}
              </button>
            </div>
          )}
        </div>
      )

    case 'CSAT':
      return (
        <div className="space-y-4">
          <CSATRating value={selectedScore} onChange={onScoreChange} disabled={isSubmitting} />
          {selectedScore !== undefined && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Share more details (optional)
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder={getPlaceholderText(feedbackType)}
                  className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
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
                    <span>Submitting...</span>
                  </div>
                ) : (
                  content.submitButtonText
                )}
              </button>
            </div>
          )}
        </div>
      )

    case 'CES':
      return (
        <div className="space-y-4">
          <CESRating value={selectedScore} onChange={onScoreChange} disabled={isSubmitting} />
          {selectedScore !== undefined && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Share more details (optional)
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder={getPlaceholderText(feedbackType)}
                  className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
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
                    <span>Submitting...</span>
                  </div>
                ) : (
                  content.submitButtonText
                )}
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
        <div className="flex flex-col h-full">
          {/* Scrollable existing feedback section */}
          <div className="flex-1 overflow-y-auto max-h-80">
            <PublicFeedbackDisplay
              feedbackType="BUG_REPORT"
              widgetKey={widgetKey || ''}
              colors={colors}
            />
          </div>

          {/* Fixed form at bottom */}
          <div
            className="border-t pt-4 backdrop-blur-sm"
            style={{ backgroundColor: `${colors.background}95` }}
          >
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
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto max-h-80">
            <PublicFeedbackDisplay
              feedbackType="FEATURE_REQUEST"
              widgetKey={widgetKey || ''}
              colors={colors}
            />
          </div>

          <div
            className="border-t pt-4 backdrop-blur-sm"
            style={{ backgroundColor: `${colors.background}95` }}
          >
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
        placeholder=""
        className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
        style={{
          borderColor: feedback.trim() ? colors.primary : '#E5E7EB',
          backgroundColor: colors.background,
          color: colors.text,
          boxShadow: feedback.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
        }}
        disabled={isSubmitting}
      />
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || isSubmitting}
        className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transform"
        style={{
          backgroundColor: colors.buttonColor,
          color: colors.buttonTextColor,
          boxShadow: `0 4px 12px ${colors.buttonColor}30`,
        }}
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
