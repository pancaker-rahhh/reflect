import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { RecentActivity, FeedbackType } from '@/types'

interface RecentActivityTableProps {
  activities: RecentActivity[]
}

const typeConfig: Record<FeedbackType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  survey: { label: 'Survey', variant: 'default' },
  review: { label: 'Review', variant: 'success' },
  bug: { label: 'Bug', variant: 'destructive' },
  feature: { label: 'Feature', variant: 'secondary' }
}

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-base text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">Summary</th>
            <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">Submitted By</th>
            <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="px-4 py-4">
                <Badge variant={typeConfig[activity.type].variant}>
                  {typeConfig[activity.type].label}
                </Badge>
              </td>
              <td className="px-4 py-4 text-sm font-medium">{activity.summary}</td>
              <td className="px-4 py-4 text-sm text-muted-foreground">{activity.submittedBy}</td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}