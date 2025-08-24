import { apiClient } from '../client'
import type { DashboardMetrics, RecentActivity } from '@/types'

async function getDashboardMetrics(timeRange?: string): Promise<DashboardMetrics> {
  const params = new URLSearchParams()
  if (timeRange && timeRange !== 'all') {
    params.append('time_range', timeRange)
  }

  return apiClient.get(`/dashboard/metrics?${params.toString()}`)
}

async function getRecentActivity(projectId?: string): Promise<RecentActivity[]> {
  const params = new URLSearchParams()
  if (projectId) {
    params.append('project_id', projectId)
  }

  return apiClient.get(`/feedback/actionable?${params.toString()}`)
}

async function getFeedbackData(projectId?: string, timeRange?: string): Promise<any[]> {
  const params = new URLSearchParams()
  if (projectId) {
    params.append('project_id', projectId)
  }
  if (timeRange) {
    params.append('time_range', timeRange)
  }

  return apiClient.get(`/feedback/chart-data?${params.toString()}`)
}

export const dashboardApi = {
  getDashboardMetrics,
  getRecentActivity,
  getFeedbackData,
}
