import { useQuery } from '@tanstack/react-query'
import { widgetApi } from '@/lib/api/widget'

interface WidgetMetrics {
  total_responses: number
  unique_users: number
  last_activity: string | null
  time_range: string
}

export function useWidgetMetrics(widgetId: string, timeRange: string = 'all') {
  return useQuery<WidgetMetrics>({
    queryKey: ['widget-metrics', widgetId, timeRange],
    queryFn: () => widgetApi.getMetrics(widgetId, timeRange) as Promise<WidgetMetrics>,
    refetchInterval: 30000,
    enabled: !!widgetId,
  })
}
