import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Calendar,
  User,
  ThumbsUp,
  Mail,
  Layout,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Star as StarIcon,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { FeedbackConversionModal } from './FeedbackConversionModal'

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

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
  const [isExpanded, setIsExpanded] = useState(false)

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

  const ratingBasedTypes = ['CES', 'NPS', 'CSAT', 'SURVEY', 'REVIEW']
  const feedbackType = feedback.feedback_type?.toUpperCase()
  const hasMessage = feedback.message && feedback.message.trim()

  const shouldShowConvert =
    !isConverted &&
    (!ratingBasedTypes.includes(feedbackType) ||
      (ratingBasedTypes.includes(feedbackType) && hasMessage))

  // Removed tint backgrounds - using only left border for color coding

  // Get score for NPS/CSAT/CES
  const getScore = () => {
    if (feedback.rating !== null && feedback.rating !== undefined) return feedback.rating
    if (feedback.nps_score !== null && feedback.nps_score !== undefined) return feedback.nps_score
    if (feedback.csat_score !== null && feedback.csat_score !== undefined)
      return feedback.csat_score
    if (feedback.ces_score !== null && feedback.ces_score !== undefined) return feedback.ces_score
    return null
  }

  const score = getScore()
  const messageText = feedback.message || feedback.title || ''
  const isLongMessage = messageText.length > 150

  // Get left border color based on type/severity
  const getLeftBorderColor = () => {
    const feedbackType = feedback.feedback_type?.toLowerCase()

    if (feedback.severity_level) {
      const severity = feedback.severity_level.toLowerCase()
      if (severity === 'critical') return 'border-l-red-500'
      if (severity === 'high') return 'border-l-orange-500'
      if (severity === 'medium') return 'border-l-yellow-500'
      if (severity === 'low') return 'border-l-green-500'
    }
    if (feedback.feedback_metadata?.priority) {
      const priority = feedback.feedback_metadata.priority.toLowerCase()
      if (priority === 'high') return 'border-l-red-500'
      if (priority === 'medium') return 'border-l-yellow-500'
      if (priority === 'low') return 'border-l-green-500'
    }
    // NPS scoring (0-10)
    if (feedbackType === 'nps' && score !== null) {
      if (score >= 9) return 'border-l-green-500'
      if (score >= 7) return 'border-l-yellow-500'
      return 'border-l-red-500'
    }
    // CSAT and CES scoring (1-5)
    if ((feedbackType === 'csat' || feedbackType === 'ces') && score !== null) {
      if (score >= 4) return 'border-l-green-500'
      if (score >= 3) return 'border-l-yellow-500'
      return 'border-l-red-500'
    }
    // Review ratings (1-5 stars)
    if (feedback.overall_rating) {
      if (feedback.overall_rating >= 4) return 'border-l-green-500'
      if (feedback.overall_rating >= 3) return 'border-l-yellow-500'
      return 'border-l-red-500'
    }
    return 'border-l-blue-500'
  }

  return (
    <>
      <Card
        className={cn(
          'group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-4',
          getLeftBorderColor(),
          isSelectionMode && 'cursor-pointer',
          isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5'
        )}
        onClick={handleCardClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {/* Header with type badge and title */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs font-medium">
                  {feedback.feedback_type?.replace('_', ' ').toUpperCase()}
                </Badge>
                {isConverted && (
                  <Badge
                    variant="default"
                    className="text-xs bg-green-100 text-green-800 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Converted
                  </Badge>
                )}
                {/* Score Badge for NPS/CSAT/CES */}
                {score !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-semibold',
                      score >= (feedback.feedback_type?.toLowerCase() === 'nps' ? 9 : 4) &&
                        'bg-green-50 text-green-700 border-green-300',
                      score >= (feedback.feedback_type?.toLowerCase() === 'nps' ? 4 : 3) &&
                        score < (feedback.feedback_type?.toLowerCase() === 'nps' ? 9 : 4) &&
                        'bg-yellow-50 text-yellow-700 border-yellow-300',
                      score < (feedback.feedback_type?.toLowerCase() === 'nps' ? 4 : 3) &&
                        'bg-red-50 text-red-700 border-red-300'
                    )}
                  >
                    {feedback.feedback_type?.toLowerCase() === 'nps' && (
                      <BarChart3 className="h-3 w-3 mr-1" />
                    )}
                    {feedback.feedback_type?.toLowerCase() === 'csat' && (
                      <StarIcon className="h-3 w-3 mr-1" />
                    )}
                    {feedback.feedback_type?.toLowerCase() === 'ces' && (
                      <Zap className="h-3 w-3 mr-1" />
                    )}
                    <span className="font-bold">{score}</span>
                    <span className="opacity-70">
                      /{feedback.feedback_type?.toLowerCase() === 'nps' ? '10' : '5'}
                    </span>
                  </Badge>
                )}
                {/* NPS Category Badge */}
                {feedback.promoter_category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-medium capitalize',
                      feedback.promoter_category === 'promoter' &&
                        'bg-green-100 text-green-700 border-green-200',
                      feedback.promoter_category === 'passive' &&
                        'bg-yellow-100 text-yellow-700 border-yellow-200',
                      feedback.promoter_category === 'detractor' &&
                        'bg-red-100 text-red-700 border-red-200'
                    )}
                  >
                    {feedback.promoter_category}
                  </Badge>
                )}
                {/* Bug Report Severity */}
                {feedback.feedback_type === 'bug_report' && feedback.severity_level && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-medium px-2 py-0.5',
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
                )}
                {/* Feature Request Priority */}
                {feedback.feedback_type === 'feature_request' &&
                  feedback.feedback_metadata?.priority && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-medium px-2 py-0.5',
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
                  )}
                {/* Review Stars */}
                {feedback.feedback_type === 'review' && feedback.overall_rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-base',
                          i < feedback.overall_rating ? 'text-yellow-500' : 'text-gray-300'
                        )}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-semibold text-yellow-700 ml-1">
                      {feedback.overall_rating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* Message with expand/collapse */}
              {messageText && (
                <div className="mb-3">
                  <p
                    className={cn(
                      'text-base font-semibold text-foreground leading-relaxed',
                      !isExpanded && isLongMessage && 'line-clamp-3',
                      isExpanded && 'break-words'
                    )}
                  >
                    {decodeHtmlEntities(messageText)}
                  </p>
                  {isLongMessage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(!isExpanded)
                      }}
                      className="text-xs text-primary hover:underline mt-2 flex items-center gap-1 font-medium"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 border border-muted">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {feedback.submitter_name
                      ? decodeHtmlEntities(feedback.submitter_name)
                      : 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(feedback.created_at), 'MMM d, yyyy')}</span>
                </div>
                {feedback.submitter_email && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[200px]" title={feedback.submitter_email}>
                      {feedback.submitter_email}
                    </span>
                  </div>
                )}
                {feedback.widget_name && (
                  <div className="flex items-center gap-1.5">
                    <Layout className="h-3.5 w-3.5" />
                    <span>{feedback.widget_name}</span>
                  </div>
                )}
                {(feedback.feedback_type === 'feature_request' ||
                  feedback.feedback_type === 'bug_report') &&
                  feedback.feedback_votes !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp
                        className={cn(
                          'h-3.5 w-3.5',
                          feedback.feedback_votes > 0 && 'text-primary fill-primary'
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          feedback.feedback_votes > 0 ? 'text-primary' : ''
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
                    variant="ghost"
                    onClick={handleConvertClick}
                    disabled={isConverting}
                    className="opacity-60 hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
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
        </CardContent>
      </Card>

      <FeedbackConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onConvert={handleConvert}
        feedback={{
          id: feedback.id,
          feedback_type: feedback.feedback_type,
          title: feedback.title || feedback.message || 'No title',
        }}
      />
    </>
  )
}
