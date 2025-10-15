import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle, Loader2, Calendar, User } from 'lucide-react'
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
      const detailViewTypes = ['CES', 'NPS', 'CSAT', 'SURVEY', 'REVIEW', 'BUG_REPORT']
      const feedbackType = feedback.feedback_type?.toUpperCase()
      if (detailViewTypes.includes(feedbackType)) {
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

  const getSeverityStyles = (severity: string) => {
    const level = severity?.toLowerCase()
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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

              <h3
                className="font-semibold text-lg mb-2"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  display: 'block',
                  width: '100%',
                }}
              >
                {feedback.title || 'No title'}
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
                className={cn('text-xs', getSeverityStyles(feedback.severity_level))}
              >
                {feedback.severity_level}
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
