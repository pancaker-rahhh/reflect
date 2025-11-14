import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Type,
  CheckSquare,
  BarChart3,
  Star as StarIcon,
  Zap,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { FormResponseV2, FormFieldV2 } from '@/types'
import { renderFieldAnswer } from '@/lib/formResponseHelpers'

interface FormResponseCardProps {
  response: FormResponseV2
  fields: FormFieldV2[]
}

export function FormResponseCard({ response, fields }: FormResponseCardProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())

  const answers = Object.entries(response.answers)

  const toggleExpand = (fieldKey: string) => {
    setExpandedFields((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey)
      } else {
        newSet.add(fieldKey)
      }
      return newSet
    })
  }

  // Get score for NPS/CSAT/CES fields
  const getScoreInfo = (field: FormFieldV2 | undefined, answer: any) => {
    if (!field || field.field_type !== 'number') return null

    const label = field.label.toLowerCase()
    const score = Number(answer)

    if (label.includes('recommend') || label.includes('nps')) {
      return {
        type: 'nps',
        score,
        max: 10,
        color:
          score >= 9
            ? 'bg-green-50 text-green-700 border-green-300'
            : score >= 4
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
              : 'bg-red-50 text-red-700 border-red-300',
        category: score >= 9 ? 'Promoter' : score >= 4 ? 'Passive' : 'Detractor',
        icon: BarChart3,
      }
    }

    // Check for review rating (has review_rating in field_key or "rate"/"review" in label but not satisfied/easy)
    if (
      field.field_key.includes('review_rating') ||
      ((label.includes('rate') || label.includes('review')) &&
        !label.includes('satisfied') &&
        !label.includes('easy'))
    ) {
      return {
        type: 'review',
        score,
        max: 5,
        color:
          score >= 4
            ? 'bg-green-50 text-green-700 border-green-300'
            : score >= 3
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
              : 'bg-red-50 text-red-700 border-red-300',
        icon: StarIcon,
        isStarRating: true,
      }
    }

    if (label.includes('satisfied') || label.includes('score')) {
      return {
        type: 'csat',
        score,
        max: 5,
        color:
          score >= 4
            ? 'bg-green-50 text-green-700 border-green-300'
            : score >= 3
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
              : 'bg-red-50 text-red-700 border-red-300',
        icon: StarIcon,
      }
    }

    if (label.includes('easy')) {
      return {
        type: 'ces',
        score,
        max: 5,
        color:
          score >= 4
            ? 'bg-green-50 text-green-700 border-green-300'
            : score >= 3
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
              : 'bg-red-50 text-red-700 border-red-300',
        icon: Zap,
      }
    }

    return null
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500'
      )}
    >
      <CardContent className="pt-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs font-medium">
                FORM RESPONSE
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {format(new Date(response.created_at), 'MMM d, yyyy')}
              </Badge>
            </div>

            {/* Submitter Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {response.submitter_name || 'Anonymous'}
                </span>
              </div>
              {response.submitter_email && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px]" title={response.submitter_email}>
                    {response.submitter_email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Form Fields and Answers */}
        <div className="space-y-5">
          {answers.map(([fieldKey, answer]) => {
            const field = fields.find((f) => f.field_key === fieldKey)
            const isTextAnswer = field?.field_type === 'text' && typeof answer === 'string'
            const isLongAnswer = isTextAnswer && String(answer).length > 150
            const isExpanded = expandedFields.has(fieldKey)
            const scoreInfo = getScoreInfo(field, answer)

            return (
              <div key={fieldKey} className="pb-5 border-b border-border last:border-b-0 last:pb-0">
                {/* Field Label with Type Icon */}
                <div className="flex items-center gap-2 mb-3">
                  {field?.field_type === 'text' && (
                    <Type className="h-4 w-4 text-muted-foreground" />
                  )}
                  {field?.field_type === 'number' && (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  )}
                  {field?.field_type === 'choice' && (
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold text-foreground">
                    {field?.label || fieldKey}
                  </span>
                  {field?.is_required && (
                    <span className="text-xs text-red-500 font-medium">*</span>
                  )}
                </div>

                {/* Answer Display */}
                <div className="ml-6">
                  {scoreInfo ? (
                    // Score/Rating Display with Color Coding
                    scoreInfo.isStarRating ? (
                      // Star Rating Display for Reviews
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }, (_, i) => {
                            const num = i + 1
                            const isFilled = scoreInfo.score >= num
                            return (
                              <StarIcon
                                key={num}
                                className={cn(
                                  'w-5 h-5 transition-colors',
                                  isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                )}
                              />
                            )
                          })}
                          <Badge
                            variant="outline"
                            className={cn('text-sm font-semibold px-2 py-1 ml-2', scoreInfo.color)}
                          >
                            <span className="font-bold">{scoreInfo.score}</span>
                            <span className="opacity-70 ml-1">/{scoreInfo.max}</span>
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][scoreInfo.score]}
                        </div>
                      </div>
                    ) : (
                      // Regular Score Display (NPS/CSAT/CES)
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn('text-sm font-semibold px-3 py-1.5', scoreInfo.color)}
                        >
                          <scoreInfo.icon className="h-4 w-4 mr-1.5" />
                          <span className="font-bold text-base">{scoreInfo.score}</span>
                          <span className="opacity-70 ml-1">/{scoreInfo.max}</span>
                        </Badge>
                        {scoreInfo.category && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs font-medium capitalize',
                              scoreInfo.category === 'Promoter' &&
                                'bg-green-100 text-green-700 border-green-200',
                              scoreInfo.category === 'Passive' &&
                                'bg-yellow-100 text-yellow-700 border-yellow-200',
                              scoreInfo.category === 'Detractor' &&
                                'bg-red-100 text-red-700 border-red-200'
                            )}
                          >
                            {scoreInfo.category}
                          </Badge>
                        )}
                      </div>
                    )
                  ) : isLongAnswer ? (
                    // Long Text Answer with Expand/Collapse
                    <div>
                      <p
                        className={cn(
                          'text-sm text-foreground leading-relaxed',
                          !isExpanded && 'line-clamp-3',
                          isExpanded && 'break-words'
                        )}
                      >
                        {String(answer)}
                      </p>
                      <button
                        onClick={() => toggleExpand(fieldKey)}
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
                    </div>
                  ) : (
                    // Regular Answer Display
                    <div>{renderFieldAnswer(fieldKey, answer, fields)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
