import { useQuery } from '@tanstack/react-query'

interface WidgetMetrics {
  total_responses: number
  unique_users: number
  last_activity: string | null
  time_range: string
}

export function useWidgetMetrics(widgetId: string, timeRange: string = 'all') {
  return useQuery<WidgetMetrics>({
    queryKey: ['widget-metrics', widgetId, timeRange],
    queryFn: () =>
      Promise.resolve({
        total_responses: 0,
        unique_users: 0,
        last_activity: null,
        time_range: timeRange,
      } as WidgetMetrics),
    refetchInterval: 30000,
    enabled: !!widgetId,
  })
}
