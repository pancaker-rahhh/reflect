import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { FeedbackConversionModal } from '@/components/feedback/FeedbackConversionModal'
import { useFeedbackConversion } from '@/hooks/useFeedbackConversion'
import type { RecentActivity } from '@/types'

interface ConversionData {
  priority: 'low' | 'medium' | 'high' | 'critical'
  conversion_notes?: string
  custom_tags?: string[]
}

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

export function RecentActivityTable({
  activities,
  projectId: _projectId,
}: RecentActivityTableProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<RecentActivity | null>(null)
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false)
  const { convertFeedbackToRoadmap } = useFeedbackConversion()

  const handleConvertFeedback = async (conversionData: ConversionData) => {
    if (!selectedFeedback?.id) return

    try {
      await convertFeedbackToRoadmap(selectedFeedback.id, conversionData)
    } catch (error) {
      console.error('Failed to convert feedback:', error)
    }
  }

  const openConversionModal = (feedback: RecentActivity) => {
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
      <div className="space-y-6">
        {activities.map((activity) => {
          const isConverted = activity.converted_to_action_item_id
          const isActionable = activity.is_actionable !== false
          const typeConfigItem = typeConfig[activity.type] || {
            label: activity.type,
            variant: 'default',
          }

          return (
            <div
              key={activity.id}
              className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        typeConfigItem.variant === 'destructive'
                          ? 'bg-red-500'
                          : typeConfigItem.variant === 'success'
                            ? 'bg-green-500'
                            : typeConfigItem.variant === 'secondary'
                              ? 'bg-blue-500'
                              : 'bg-purple-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {typeConfigItem.label}
                    </span>
                    {isConverted && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>

                  <h3 className="text-base font-medium text-gray-900 mb-2 leading-relaxed">
                    {activity.summary}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {activity.submittedBy}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {!isConverted && isActionable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConversionModal(activity)}
                      className="h-8 px-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Convert
                    </Button>
                  )}
                  {isConverted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-4 text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedFeedback && (
        <FeedbackConversionModal
          isOpen={isConversionModalOpen}
          onClose={closeConversionModal}
          onConvert={handleConvertFeedback}
          feedback={{
            id: selectedFeedback.id,
            feedback_type: selectedFeedback.type,
            title: selectedFeedback.summary,
            message: undefined,
          }}
        />
      )}
    </>
  )
}
