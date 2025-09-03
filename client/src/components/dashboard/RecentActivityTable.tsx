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
  string,
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
  NPS: { label: 'NPS', variant: 'outline' },
  CSAT: { label: 'CSAT', variant: 'outline' },
  CES: { label: 'CES', variant: 'outline' },
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
              const isConverted = activity.converted_to_action_item_id
              const isActionable = activity.is_actionable !== false
              const typeConfigItem = typeConfig[activity.type] || {
                label: activity.type,
                variant: 'default',
              }

              return (
                <tr key={activity.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <Badge variant={typeConfigItem.variant}>{typeConfigItem.label}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.summary}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-muted-foreground">{activity.submittedBy}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isConverted ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Converted
                        </Badge>
                      ) : (
                        <Badge variant={isActionable ? 'default' : 'secondary'}>
                          {isActionable ? 'Actionable' : 'Archived'}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!isConverted && isActionable && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConversionModal(activity)}
                          className="h-8 px-3"
                        >
                          Convert
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {isConverted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3 text-green-600 hover:text-green-700"
                        >
                          View Roadmap
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <FeedbackConversionModal
        isOpen={isConversionModalOpen}
        onClose={closeConversionModal}
        onConvert={handleConvertFeedback}
        feedback={selectedFeedback}
      />
    </>
  )
}
