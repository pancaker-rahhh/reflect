import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, MessageSquare, Star, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FeedbackDetailModalProps {
  isOpen: boolean
  onClose: () => void
  feedback: any
}

export function FeedbackDetailModal({ isOpen, onClose, feedback }: FeedbackDetailModalProps) {
  if (!feedback) return null

  const getScoreIcon = (type: string) => {
    switch (type) {
      case 'NPS':
        return <BarChart3 className="h-4 w-4" />
      case 'CSAT':
        return <Star className="h-4 w-4" />
      case 'CES':
        return <Zap className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getScoreValue = () => {
    if (feedback.rating !== null && feedback.rating !== undefined) {
      return feedback.rating
    }

    if (
      feedback.feedback_type === 'NPS' &&
      feedback.nps_score !== null &&
      feedback.nps_score !== undefined
    ) {
      return feedback.nps_score
    }
    if (
      feedback.feedback_type === 'CSAT' &&
      feedback.csat_score !== null &&
      feedback.csat_score !== undefined
    ) {
      return feedback.csat_score
    }
    if (
      feedback.feedback_type === 'CES' &&
      feedback.ces_score !== null &&
      feedback.ces_score !== undefined
    ) {
      return feedback.ces_score
    }
    return null
  }

  const getScoreLabel = () => {
    switch (feedback.feedback_type) {
      case 'NPS':
        return 'NPS Score'
      case 'CSAT':
        return 'Satisfaction Score'
      case 'CES':
        return 'Effort Score'
      default:
        return 'Rating'
    }
  }

  const getScoreColor = (score: number, type: string) => {
    if (type === 'NPS') {
      if (score >= 9) return 'text-green-600'
      if (score >= 7) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'CSAT' || type === 'CES') {
      if (score >= 4) return 'text-green-600'
      if (score >= 3) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  const score = getScoreValue()
  const scoreLabel = getScoreLabel()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {feedback.feedback_type?.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-lg font-semibold">{feedback.title || 'Survey Response'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {score !== null && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getScoreIcon(feedback.feedback_type)}
                <span className="font-medium text-gray-700">{scoreLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn('text-3xl font-bold', getScoreColor(score, feedback.feedback_type))}
                >
                  {score}
                </span>
                <span className="text-sm text-gray-500">
                  {feedback.feedback_type === 'NPS' ? '/ 10' : '/ 5'}
                </span>
              </div>
            </div>
          )}

          {feedback.message && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Response
              </h4>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'NPS' && feedback.promoter_category && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">NPS Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Category:</span>
                  <span className="font-medium text-blue-900 capitalize">
                    {feedback.promoter_category}
                  </span>
                </div>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'CSAT' && feedback.satisfaction_level && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">CSAT Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Level:</span>
                  <span className="font-medium text-green-900 capitalize">
                    {feedback.satisfaction_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'CES' && feedback.ease_level && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">CES Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Ease Level:</span>
                  <span className="font-medium text-purple-900 capitalize">
                    {feedback.ease_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Submission Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Submitter:</span>
                <span className="font-medium">{feedback.submitter_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {feedback.submitter_email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{feedback.submitter_email}</span>
                </div>
              )}
              {feedback.widget_name && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Widget:</span>
                  <span className="font-medium">{feedback.widget_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
