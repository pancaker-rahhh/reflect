import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle, Loader2, Calendar, User, ThumbsUp } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getTintByScoreOutOfFive } from '@/lib/tints'
import { FeedbackConversionModal } from './FeedbackConversionModal'
import { FeedbackDetailModal } from './FeedbackDetailModal'

interface FeedbackCardProps {
  feedback: any
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelection: (feedbackId: string) => void
  onConvert: (feedbackId: string, conversionData: any) => Promise<void>
  isConverting?: boolean
}

export function FeedbackCard({
  feedback,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  onConvert,
  isConverting = false,
}: FeedbackCardProps) {
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleConvert = async (conversionData: any) => {
    await onConvert(feedback.id, conversionData)
    setIsConversionModalOpen(false)
  }

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelection(feedback.id)
    } else {
      const surveyTypes = ['CES', 'NPS', 'CSAT', 'SURVEY', 'REVIEW']
      const feedbackType = feedback.feedback_type?.toUpperCase()
      if (surveyTypes.includes(feedbackType)) {
        setIsDetailModalOpen(true)
      }
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelection(feedback.id)
  }

  const handleConvertClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConversionModalOpen(true)
  }

  const isConverted = feedback.converted_to_action_item_id

  const ratingBasedTypes = ['CES', 'NPS', 'CSAT', 'SURVEY', 'REVIEW']
  const feedbackType = feedback.feedback_type?.toUpperCase()
  const hasMessage = feedback.message && feedback.message.trim()

  const shouldShowConvert =
    !isConverted &&
    (!ratingBasedTypes.includes(feedbackType) ||
      (ratingBasedTypes.includes(feedbackType) && hasMessage))

  const tintClass = getTintByScoreOutOfFive(feedback.overall_rating)

  return (
    <>
      <Card
        className={cn(
          'group transition-all duration-200 hover:shadow-md',
          isSelectionMode && 'cursor-pointer',
          isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5',
          !isSelected && feedback.overall_rating && `${tintClass} border border-transparent`
        )}
        onClick={handleCardClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {/* Header with type badge and title */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {feedback.feedback_type?.replace('_', ' ').toUpperCase()}
                </Badge>
                {isConverted && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Converted
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {feedback.message || feedback.title || 'No title'}
              </h3>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{feedback.submitter_name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(feedback.created_at), 'MMM d, yyyy')}</span>
                </div>
                {(feedback.feedback_type === 'feature_request' ||
                  feedback.feedback_type === 'bug_report') &&
                  feedback.feedback_votes !== undefined && (
                    <div className="flex items-center gap-1">
                      <ThumbsUp
                        className={cn(
                          'h-3 w-3',
                          feedback.feedback_votes > 0 && 'text-primary fill-primary'
                        )}
                      />
                      <span
                        className={cn(
                          feedback.feedback_votes > 0 ? 'text-primary font-medium' : ''
                        )}
                      >
                        {feedback.feedback_votes || 0}{' '}
                        {feedback.feedback_votes === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              {isSelectionMode ? (
                <Checkbox
                  checked={isSelected}
                  onClick={handleCheckboxClick}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              ) : (
                shouldShowConvert && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleConvertClick}
                    disabled={isConverting}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {isConverting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Convert
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>

          {feedback.feedback_type === 'bug_report' && feedback.severity_level && (
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium px-2 py-1',
                  feedback.severity_level.toLowerCase() === 'critical' &&
                    'bg-destructive/10 text-destructive border-destructive/20',
                  feedback.severity_level.toLowerCase() === 'high' &&
                    'bg-orange-100 text-orange-700 border-orange-200',
                  feedback.severity_level.toLowerCase() === 'medium' &&
                    'bg-yellow-100 text-yellow-700 border-yellow-200',
                  feedback.severity_level.toLowerCase() === 'low' &&
                    'bg-green-100 text-green-700 border-green-200'
                )}
              >
                {feedback.severity_level}
              </Badge>
            </div>
          )}

          {feedback.feedback_type === 'feature_request' && feedback.feedback_metadata?.priority && (
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium px-2 py-1',
                  feedback.feedback_metadata.priority.toLowerCase() === 'high' &&
                    'bg-destructive/10 text-destructive border-destructive/20',
                  feedback.feedback_metadata.priority.toLowerCase() === 'medium' &&
                    'bg-yellow-100 text-yellow-700 border-yellow-200',
                  feedback.feedback_metadata.priority.toLowerCase() === 'low' &&
                    'bg-green-100 text-green-700 border-green-200'
                )}
              >
                {feedback.feedback_metadata.priority === 'low' && '😌 Nice to Have'}
                {feedback.feedback_metadata.priority === 'medium' && '😊 Important'}
                {feedback.feedback_metadata.priority === 'high' && '🚀 Critical'}
              </Badge>
            </div>
          )}

          {feedback.feedback_type === 'review' && feedback.overall_rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-sm',
                      i < feedback.overall_rating ? 'text-yellow-500' : 'text-gray-300'
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-yellow-800">{feedback.overall_rating}/5</span>
            </div>
          )}
        </CardContent>
      </Card>

      <FeedbackConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onConvert={handleConvert}
        feedback={{
          id: feedback.id,
          feedback_type: feedback.feedback_type,
          title: feedback.title || 'No title',
          message: feedback.message,
        }}
      />

      <FeedbackDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        feedback={feedback}
      />
    </>
  )
}
