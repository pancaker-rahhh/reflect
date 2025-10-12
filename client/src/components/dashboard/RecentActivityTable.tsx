import { formatDistanceToNow } from 'date-fns'
import type { RecentActivity } from '@/types'

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
                        backgroundColor:
                          typeConfigItem.variant === 'destructive'
                            ? 'hsl(var(--tint-danger))'
                            : typeConfigItem.variant === 'success'
                              ? 'hsl(var(--tint-success))'
                              : typeConfigItem.variant === 'secondary'
                                ? 'hsl(var(--tint-info))'
                                : 'hsl(var(--tint-primary))',
                      }}
                    />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      {typeConfigItem.label}
                    </span>

                    {activity.widget_name && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs">{activity.widget_name}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-medium mb-2 leading-relaxed">{activity.summary}</h3>

                  <div className="flex items-center gap-4 text-sm">
                    <span>By {activity.submittedBy}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>

                    {activity.rating && (
                      <>
                        <span>•</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                          Rating: {activity.rating}
                        </span>
                      </>
                    )}
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
