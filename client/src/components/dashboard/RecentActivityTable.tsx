import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Archive } from 'lucide-react'
import { useState } from 'react'
import { FeedbackConversionModal } from '@/components/feedback/FeedbackConversionModal'
import { useFeedbackConversion } from '@/hooks/useFeedbackConversion'
import type { RecentActivity, FeedbackType } from '@/types'

interface RecentActivityTableProps {
  activities: RecentActivity[]
  projectId?: string
}

const typeConfig: Record<
  FeedbackType,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  }
> = {
  general: { label: 'General', variant: 'default' },
  survey: { label: 'Survey', variant: 'default' },
  review: { label: 'Review', variant: 'success' },
  bug_report: { label: 'Bug Report', variant: 'destructive' },
  feature_request: { label: 'Feature Request', variant: 'secondary' },
  nps: { label: 'NPS', variant: 'outline' },
  csat: { label: 'CSAT', variant: 'outline' },
  ces: { label: 'CES', variant: 'outline' },
}

export function RecentActivityTable({ activities, projectId }: RecentActivityTableProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false)
  const { convertFeedbackToRoadmap } = useFeedbackConversion()

  const handleConvertFeedback = async (conversionData: any) => {
    if (!selectedFeedback?.id) return

    try {
      await convertFeedbackToRoadmap(selectedFeedback.id, conversionData)
    } catch (error) {
      console.error('Failed to convert feedback:', error)
    }
  }

  const openConversionModal = (feedback: any) => {
    setSelectedFeedback(feedback)
    setIsConversionModalOpen(true)
  }

  const closeConversionModal = () => {
    setIsConversionModalOpen(false)
    setSelectedFeedback(null)
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-base text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Summary
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Submitted By
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const isConverted = activity.converted_to_roadmap_id
              const isActionable = activity.is_actionable !== false

              return (
                <tr key={activity.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <Badge variant={typeConfig[activity.type].variant}>
                      {typeConfig[activity.type].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">{activity.summary}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {activity.submittedBy}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4">
                    {isConverted ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Converted
                      </Badge>
                    ) : !isActionable ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Not Actionable
                      </Badge>
                    ) : (
                      <Badge variant="outline">New</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {isActionable && !isConverted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConversionModal(activity)}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Convert
                      </Button>
                    )}
                    {isConverted && (
                      <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                        Already Converted
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Conversion Modal */}
      {selectedFeedback && (
        <FeedbackConversionModal
          isOpen={isConversionModalOpen}
          onClose={closeConversionModal}
          feedback={selectedFeedback}
          onConvert={handleConvertFeedback}
        />
      )}
    </>
  )
}
