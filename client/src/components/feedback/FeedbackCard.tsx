import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle, Loader2, Calendar, User, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { FeedbackConversionModal } from './FeedbackConversionModal'

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

  const handleConvert = async (conversionData: any) => {
    await onConvert(feedback.id, conversionData)
    setIsConversionModalOpen(false)
  }

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelection(feedback.id)
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

  return (
    <>
      <Card
        className={cn(
          'group transition-all duration-200 hover:shadow-md',
          isSelectionMode && 'cursor-pointer',
          isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5'
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

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {feedback.title || 'No title'}
              </h3>

              {/* Content preview */}
              {feedback.message && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {feedback.message}
                </p>
              )}

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
                {feedback.message && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{feedback.message.length > 100 ? 'Long message' : 'Short message'}</span>
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
                !isConverted && (
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

          {/* Type-specific content */}
          {feedback.feedback_type === 'bug_report' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="text-xs">
                  {feedback.severity_level || 'MEDIUM'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {feedback.status || 'NEW'}
                </Badge>
              </div>
              {feedback.actual_behavior && (
                <p className="text-sm text-red-800">
                  <strong>Issue:</strong> {feedback.actual_behavior}
                </p>
              )}
            </div>
          )}

          {feedback.feedback_type === 'feature_request' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              {feedback.use_case && (
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Use Case:</strong> {feedback.use_case}
                </p>
              )}
              {feedback.suggested_solution && (
                <p className="text-sm text-blue-800">
                  <strong>Solution:</strong> {feedback.suggested_solution}
                </p>
              )}
            </div>
          )}

          {feedback.feedback_type === 'review' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'text-sm',
                        i < (feedback.overall_rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-yellow-800">{feedback.overall_rating || 0}/5</span>
              </div>
              {feedback.pros && (
                <p className="text-sm text-yellow-800 mb-1">
                  <strong>Pros:</strong> {feedback.pros}
                </p>
              )}
              {feedback.cons && (
                <p className="text-sm text-yellow-800">
                  <strong>Cons:</strong> {feedback.cons}
                </p>
              )}
            </div>
          )}

          {feedback.feedback_type === 'survey' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                  {feedback.survey_type || 'SURVEY'}
                </Badge>
                <span className="text-sm text-purple-800 font-medium">
                  Score: {feedback.score || feedback.rating || 0}/10
                </span>
              </div>
              {feedback.comment && (
                <p className="text-sm text-purple-800">
                  <strong>Comment:</strong> {feedback.comment}
                </p>
              )}
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
    </>
  )
}
