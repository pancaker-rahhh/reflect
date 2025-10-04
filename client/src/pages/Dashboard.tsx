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
import { WarningCircle, ArrowClockwise, Warning } from 'phosphor-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscription } from '@/hooks/useSubscription'
import { organizationApi } from '@/lib/api/organization'
import { useNavigate } from 'react-router-dom'
import { FreeTierAlert } from '@/components/widgets/SubscriptionMessagesBanner'

export type TimeRange = 'all' | 'week' | 'month' | 'year'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const navigate = useNavigate()
  const { currentProject } = useAppContext()
  const { getUsageInfo } = useSubscription()

  const handleUpgrade = () => {
    navigate('/app/settings/account?tab=billing')
  }

  const { data: organizations } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
  })

  const currentOrganization = organizations?.[0]

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
    queryKey: ['feedback-data', timeRange, currentProject?.id],
    queryFn: () => api.getFeedbackData(undefined, currentProject?.id, timeRange),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
    retry: 3,
    retryDelay: 1000,
  })

  const renderErrorState = (_error: any, refetch: () => void, title: string) => (
    <Alert variant="destructive" className="mb-4">
      <WarningCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Failed to load {title}. Please try again.</span>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
          <ArrowClockwise className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Summary for {currentProject?.name || 'All Projects'} for{' '}
            {timeRange === 'all' ? 'all time' : timeRange}
          </p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Response Limit Warning - Only for Free Users */}
      {(() => {
        const responseUsage = getUsageInfo('responses')
        const isFreeTier =
          currentOrganization?.subscription_plan === 'free' ||
          !currentOrganization?.subscription_plan
        if (isFreeTier && responseUsage.percentage >= 80) {
          return (
            <Alert
              className={`border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30`}
            >
              <Warning className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200 flex items-center justify-between">
                <span>
                  {responseUsage.percentage >= 100
                    ? `You've reached your response limit (${responseUsage.current}/${responseUsage.limit}). Upgrade to Pro for unlimited responses.`
                    : `You're approaching your response limit (${responseUsage.current}/${responseUsage.limit}). Consider upgrading to Pro for unlimited responses.`}
                </span>
                <Button size="sm" variant="outline" onClick={handleUpgrade} className="ml-4">
                  Upgrade to Pro
                </Button>
              </AlertDescription>
            </Alert>
          )
        }
        return null
      })()}

      {/* Metrics Section */}
      {metricsError && renderErrorState(metricsError, refetchMetrics, 'dashboard metrics')}

      {metricsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        metrics && <MetricsCards metrics={metrics} />
      )}

      {/* Free Tier Alert */}
      <FreeTierAlert />

      {/* Main Content Grid */}
      <div className="grid gap-12 xl:grid-cols-3">
        {/* Recent Activity Section - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <div className="text-sm text-gray-500">{recentActivity?.length || 0} items</div>
            </div>

            {activityError && renderErrorState(activityError, refetchActivity, 'recent activity')}

            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              recentActivity && (
                <RecentActivityTable activities={recentActivity} projectId={currentProject?.id} />
              )
            )}
          </div>
        </div>

        {/* Charts Section - Takes 1 column */}
        <div className="space-y-8">
          {/* NPS Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-8">NPS Distribution</h2>
            {feedbackError && renderErrorState(feedbackError, refetchFeedback, 'feedback data')}

            {feedbackLoading ? (
              <Skeleton className="h-64" />
            ) : (
              feedback && <NPSDistributionChart feedback={feedback} />
            )}
          </div>

          {/* Feedback Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-8">Feedback Distribution</h2>
            {feedbackLoading ? (
              <Skeleton className="h-64" />
            ) : (
              feedback && <FeedbackDistributionChart feedback={feedback} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
