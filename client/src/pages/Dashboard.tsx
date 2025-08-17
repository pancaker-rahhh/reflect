import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services(mock)/api'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { TimeRangeFilter } from '@/components/dashboard/TimeRangeFilter'
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable'
import { NPSDistributionChart } from '@/components/dashboard/NPSDistributionChart'
import { FeedbackDistributionChart } from '@/components/dashboard/FeedbackDistributionChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppContext } from '@/context/AppContext'
import { FolderOpen, Plus } from 'lucide-react'

export type TimeRange = 'all' | 'week' | 'month' | 'year'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const navigate = useNavigate()
  const { projects, currentProject, isLoading: appLoading } = useAppContext()

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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-base text-muted-foreground">
          Summary for webapp for all time
        </p>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {metricsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        metrics && <MetricsCards metrics={metrics} />
      )}

      <div className="grid gap-8 lg:grid-cols-2 mt-10">
        <div>
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          {activityLoading ? (
            <Skeleton className="h-96" />
          ) : (
            recentActivity && <RecentActivityTable activities={recentActivity} />
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">NPS Distribution</h2>
            {feedbackLoading ? (
              <Skeleton className="h-80" />
            ) : (
              feedback && <NPSDistributionChart feedback={feedback} />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Feedback Distribution</h2>
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