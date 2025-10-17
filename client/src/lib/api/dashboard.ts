import type { DashboardMetrics, RecentActivity } from '@/types'
import { apiClient } from '../client'

async function getDashboardMetrics(
  timeRange?: string,
  projectId?: string
): Promise<DashboardMetrics> {
  const params = new URLSearchParams()
  if (timeRange) {
    params.append('time_range', timeRange)
  }
  if (projectId) {
    params.append('projectId', projectId)
  }

  return apiClient.get(`/dashboard/metrics?${params.toString()}`)
}

async function getRecentActivity(projectId?: string): Promise<RecentActivity[]> {
  const params = new URLSearchParams()
  if (projectId) {
    params.append('projectId', projectId)
  }

  return apiClient.get(`/dashboard/recent-activity?${params.toString()}`)
}

async function getFeedbackData(
  feedbackType?: string,
  projectId?: string,
  timeRange?: string
): Promise<any[]> {
  const params = new URLSearchParams()
  if (feedbackType) {
    params.append('feedback_type', feedbackType)
  }
  if (projectId) {
    params.append('projectId', projectId)
  }
  if (timeRange && timeRange !== 'all') {
    params.append('timeRange', timeRange)
  }

  return apiClient.get(`/dashboard/feedback-data?${params.toString()}`)
}

export const dashboardApi = {
  getDashboardMetrics,
  getRecentActivity,
  getFeedbackData,
}
