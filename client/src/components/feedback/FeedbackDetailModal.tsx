import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, MessageSquare, Star, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

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
      if (score >= 9) return { color: 'hsl(var(--tint-success))' }
      if (score >= 7) return { color: 'hsl(var(--tint-warning))' }
      return { color: 'hsl(var(--destructive))' }
    }
    if (type === 'CSAT' || type === 'CES') {
      if (score >= 4) return { color: 'hsl(var(--tint-success))' }
      if (score >= 3) return { color: 'hsl(var(--tint-warning))' }
      return { color: 'hsl(var(--destructive))' }
    }
    return { color: 'hsl(var(--muted-foreground))' }
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
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getScoreIcon(feedback.feedback_type)}
                <span className="font-medium text-foreground">{scoreLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl font-bold"
                  style={getScoreColor(score, feedback.feedback_type)}
                >
                  {score}
                </span>
                <span className="text-sm text-muted-foreground">
                  {feedback.feedback_type === 'NPS' ? '/ 10' : '/ 5'}
                </span>
              </div>
            </div>
          )}

          {feedback.message && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Response
              </h4>
              <div className="bg-muted border rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">{feedback.message}</p>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'NPS' && feedback.promoter_category && (
            <div className="bg-muted border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">NPS Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground capitalize">
                    {feedback.promoter_category}
                  </span>
                </div>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'CSAT' && feedback.satisfaction_level && (
            <div className="bg-muted border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">CSAT Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium text-foreground capitalize">
                    {feedback.satisfaction_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {feedback.feedback_type === 'CES' && feedback.ease_level && (
            <div className="bg-muted border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">CES Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ease Level:</span>
                  <span className="font-medium text-foreground capitalize">
                    {feedback.ease_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-foreground mb-3">Submission Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitter:</span>
                <span className="font-medium text-foreground">
                  {feedback.submitter_name || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-foreground">
                  {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {feedback.submitter_email && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{feedback.submitter_email}</span>
                </div>
              )}
              {feedback.widget_name && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Widget:</span>
                  <span className="font-medium text-foreground">{feedback.widget_name}</span>
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
