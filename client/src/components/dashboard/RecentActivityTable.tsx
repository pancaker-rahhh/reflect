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
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left text-sm font-medium">Type</th>
            <th className="p-3 text-left text-sm font-medium">Summary</th>
            <th className="p-3 text-left text-sm font-medium">Submitted By</th>
            <th className="p-3 text-left text-sm font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <Badge variant={typeConfig[activity.type].variant}>
                  {typeConfig[activity.type].label}
                </Badge>
              </td>
              <td className="p-3 font-medium">{activity.summary}</td>
              <td className="p-3 text-muted-foreground">{activity.submittedBy}</td>
              <td className="p-3 text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}