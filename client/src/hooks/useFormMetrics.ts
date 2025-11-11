import { useQuery } from '@tanstack/react-query'
import { formApi } from '@/lib/api/form'
import type { FormMetrics } from '@/types'

export function useFormMetrics(formId: string | undefined, timeRange: string = 'all') {
  return useQuery<FormMetrics>({
    queryKey: ['form-metrics', formId, timeRange],
    queryFn: () => formApi.getMetrics(formId!, timeRange),
    enabled: !!formId,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
