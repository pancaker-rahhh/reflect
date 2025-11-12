import { formatDistanceToNow } from 'date-fns'
import type { RecentActivity } from '@/types'

interface RecentActivityTableProps {
  activities: RecentActivity[]
  projectId?: string
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

const typeConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
    color: string
  }
> = {
  general: { label: 'General', variant: 'default', color: '#3B82F6' },
  survey: { label: 'Survey', variant: 'secondary', color: '#06B6D4' },
  review: { label: 'Review', variant: 'success', color: '#10B981' },
  bug_report: { label: 'Bug Report', variant: 'destructive', color: '#EF4444' },
  feature_request: { label: 'Feature Request', variant: 'warning', color: '#F59E0B' },
  NPS: { label: 'NPS', variant: 'outline', color: '#8B5CF6' },
  CSAT: { label: 'CSAT', variant: 'outline', color: '#EC4899' },
  CES: { label: 'CES', variant: 'outline', color: '#84CC16' },
}

export function RecentActivityTable({
  activities,
  projectId: _projectId,
}: RecentActivityTableProps) {
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
          const typeConfigItem = typeConfig[activity.type] || {
            label: activity.type,
            variant: 'default',
            color: 'hsl(var(--tint-primary))',
          }

          return (
            <div
              key={activity.id}
              className="group p-4 rounded-lg border border-border hover:border-border/80 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: typeConfigItem.color,
                      }}
                    />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      {typeConfigItem.label}
                    </span>

                    {(activity.widget_name || activity.form_name) && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs">
                          {activity.widget_name || activity.form_name}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-medium mb-2 leading-relaxed">
                    {decodeHtmlEntities(activity.summary)}
                  </h3>

                  <div className="flex items-center gap-4 text-sm">
                    <span>By {decodeHtmlEntities(activity.submittedBy)}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
