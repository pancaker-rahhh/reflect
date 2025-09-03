import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { TimeRangeFilter } from '@/components/dashboard/TimeRangeFilter'
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable'
import { NPSDistributionChart } from '@/components/dashboard/NPSDistributionChart'
import { FeedbackDistributionChart } from '@/components/dashboard/FeedbackDistributionChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppContext } from '@/context/AppContext'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type TimeRange = 'all' | 'week' | 'month' | 'year'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const { currentProject } = useAppContext()

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['dashboard-metrics', timeRange, currentProject?.id],
    queryFn: () => api.getDashboardMetrics(timeRange, currentProject?.id),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
    retry: 3,
    retryDelay: 1000,
  })

  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['recent-activity', currentProject?.id],
    queryFn: () => api.getRecentActivity(currentProject?.id),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
    retry: 3,
    retryDelay: 1000,
  })

  const {
    data: feedback,
    isLoading: feedbackLoading,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery({
    queryKey: ['feedback-data', currentProject?.id],
    queryFn: () => api.getFeedbackData(undefined, currentProject?.id),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
    retry: 3,
    retryDelay: 1000,
  })

  const renderErrorState = (_error: any, refetch: () => void, title: string) => (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Failed to load {title}. Please try again.</span>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-base text-muted-foreground">
          Summary for {currentProject?.name || 'All Projects'} for{' '}
          {timeRange === 'all' ? 'all time' : timeRange}
        </p>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Metrics Section */}
      {metricsError && renderErrorState(metricsError, refetchMetrics, 'dashboard metrics')}

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
        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          {activityError && renderErrorState(activityError, refetchActivity, 'recent activity')}

          {activityLoading ? (
            <Skeleton className="h-96" />
          ) : (
            recentActivity && (
              <RecentActivityTable activities={recentActivity} projectId={currentProject?.id} />
            )
          )}
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">NPS Distribution</h2>
            {feedbackError && renderErrorState(feedbackError, refetchFeedback, 'feedback data')}

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
