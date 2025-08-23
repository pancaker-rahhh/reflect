import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { WidgetFormData } from '@/pages/WidgetCreate'
import { NPSRating } from '@/components/widgets/scoring/NPSRating'
import { CSATRating } from '@/components/widgets/scoring/CSATRating'
import { CESRating } from '@/components/widgets/scoring/CESRating'
import { PreviewState } from './LiveWidgetPreview'
import { cn } from '@/lib/utils'

interface WidgetRendererProps {
  formData: WidgetFormData
  state: PreviewState
  onInteraction: () => void
  onSubmit: () => void
  onClose: () => void
}

export function WidgetRenderer({ formData, state, onInteraction, onSubmit, onClose }: WidgetRendererProps) {
  const [selectedScore, setSelectedScore] = useState<number | undefined>()
  const [feedbackText, setFeedbackText] = useState('')

  const getThemeStyles = () => {
    switch (formData.appearance?.theme) {
      case 'midnight':
        return 'bg-gray-900 text-white border-gray-700'
      case 'minimal-light':
        return 'bg-white text-gray-900 border border-gray-200'
      case 'minimal-dark':
        return 'bg-gray-800 text-white border border-gray-600'
      default:
        return 'bg-white text-gray-900 shadow-2xl border-0'
    }
  }

  const getWidgetPosition = () => {
    const position = formData.appearance?.position || 'bottom_right'
    switch (position) {
      case 'bottom_right':
        return 'bottom-20 right-6'
      case 'bottom_left':
        return 'bottom-20 left-6'
      case 'top_right':
        return 'top-20 right-6'
      case 'top_left':
        return 'top-20 left-6'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'bottom-20 right-6'
    }
  }

  const handleScoreChange = (score: number) => {
    setSelectedScore(score)
    onInteraction()
  }

  const handleSubmit = () => {
    onSubmit()
  }

  const renderScoringComponent = () => {
    const primaryType = formData.primaryType

    switch (primaryType) {
      case 'NPS':
        return (
          <NPSRating
            value={selectedScore}
            onChange={handleScoreChange}
            disabled={state === 'thankyou'}
          />
        )
      case 'CSAT':
        return (
          <CSATRating
            value={selectedScore}
            onChange={handleScoreChange}
            disabled={state === 'thankyou'}
          />
        )
      case 'CES':
        return (
          <CESRating
            value={selectedScore}
            onChange={handleScoreChange}
            disabled={state === 'thankyou'}
          />
        )
      default:
        return (
          <textarea
            value={feedbackText}
            onChange={(e) => {
              setFeedbackText(e.target.value)
              if (e.target.value.length > 0 && state === 'open') {
                onInteraction()
              }
            }}
            placeholder="Tell us what you think..."
            className="w-full h-24 p-3 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: formData.appearance?.colors?.primary + '40' || '#6B46C140',
            }}
            disabled={state === 'thankyou'}
          />
        )
    }
  }

  if (state === 'thankyou') {
    return (
      <div 
        className={cn(
          'absolute z-20 w-80 max-w-[90vw] rounded-lg p-6 transition-all duration-300 animate-in slide-in-from-bottom-2',
          getThemeStyles(),
          getWidgetPosition()
        )}
        style={{
          backgroundColor: formData.appearance?.colors?.background || '#FFFFFF',
          color: formData.appearance?.colors?.text || '#1F2937',
        }}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {formData.content?.thankYouTitle || 'Thank you!'}
            </h3>
            <p className="text-sm opacity-90">
              {formData.content?.thankYouMessage || 'Your feedback helps us improve.'}
            </p>
          </div>
          {formData.appearance?.showBranding && (
            <div className="pt-3 border-t text-xs text-gray-500 text-center">
              Powered by Reflect
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'absolute z-20 w-80 max-w-[90vw] rounded-lg transition-all duration-300 animate-in slide-in-from-bottom-2',
        getThemeStyles(),
        getWidgetPosition()
      )}
      style={{
        backgroundColor: formData.appearance?.colors?.background || '#FFFFFF',
        color: formData.appearance?.colors?.text || '#1F2937',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-lg font-semibold">
          {formData.content?.headerTitle || 'We value your feedback'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm mb-6 opacity-90">
          {formData.content?.mainQuestion || 'How can we improve?'}
        </p>

        {/* Interactive Content */}
        <div className="mb-6">
          {renderScoringComponent()}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            (formData.primaryType === 'FEEDBACK' && !feedbackText.trim()) ||
            (['NPS', 'CSAT', 'CES'].includes(formData.primaryType) && selectedScore === undefined)
          }
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
            'hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
          style={{
            backgroundColor: formData.appearance?.colors?.buttonColor || '#6B46C1',
            color: formData.appearance?.colors?.buttonTextColor || '#FFFFFF',
          }}
        >
          {formData.content?.submitButtonText || 'Submit Feedback'}
        </button>

        {/* Branding */}
        {formData.appearance?.showBranding && (
          <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
            Powered by Reflect
          </div>
        )}
      </div>
    </div>
  )
}