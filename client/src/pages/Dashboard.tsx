import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { TimeRangeFilter } from '@/components/dashboard/TimeRangeFilter'
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable'
import { NPSDistributionChart } from '@/components/dashboard/NPSDistributionChart'
import { FeedbackDistributionChart } from '@/components/dashboard/FeedbackDistributionChart'
import { Skeleton } from '@/components/ui/skeleton'

export type TimeRange = 'all' | 'week' | 'month' | 'year'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics', timeRange],
    queryFn: () => api.getDashboardMetrics()
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.getRecentActivity()
  })

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.getFeedback()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">
          Summary for webapp for all time
        </p>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {metricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        metrics && <MetricsCards metrics={metrics} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {activityLoading ? (
            <Skeleton className="h-96" />
          ) : (
            recentActivity && <RecentActivityTable activities={recentActivity} />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">NPS Distribution</h2>
            {feedbackLoading ? (
              <Skeleton className="h-80" />
            ) : (
              feedback && <NPSDistributionChart feedback={feedback} />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Feedback Distribution</h2>
            {feedbackLoading ? (
              <Skeleton className="h-96" />
            ) : (
              feedback && <FeedbackDistributionChart feedback={feedback} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}