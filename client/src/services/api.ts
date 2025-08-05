import type {
  User,
  Workspace,
  Project,
  Widget,
  Feedback,
  DashboardMetrics,
  RecentActivity,
  NotificationSettings,
  Roadmap
} from '@/types'

const API_BASE_URL = '/api'

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return this.request<Workspace[]>('/workspaces')
  }

  async getWorkspace(id: string): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${id}`)
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects')
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`)
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // Widgets
  async getWidgets(): Promise<Widget[]> {
    return this.request<Widget[]>('/widgets')
  }

  async createWidget(widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget> {
    return this.request<Widget>('/widgets', {
      method: 'POST',
      body: JSON.stringify(widget)
    })
  }

  async updateWidget(id: string, data: Partial<Widget>): Promise<Widget> {
    return this.request<Widget>(`/widgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteWidget(id: string): Promise<void> {
    await this.request(`/widgets/${id}`, {
      method: 'DELETE'
    })
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard/metrics')
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/dashboard/activity')
  }

  // Feedback
  async getFeedback(filters?: {
    type?: string
    startDate?: Date
    endDate?: Date
    score?: number
  }): Promise<Feedback[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString())
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString())
    if (filters?.score) params.append('score', filters.score.toString())

    return this.request<Feedback[]>(`/feedback?${params.toString()}`)
  }

  // Reviews
  async getReviews(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/reviews')
  }

  // Feature Requests
  async upvoteFeature(featureId: string): Promise<void> {
    await this.request(`/features/${featureId}/upvote`, {
      method: 'POST'
    })
  }

  // Roadmap
  async getRoadmap(projectId: string): Promise<Roadmap> {
    return this.request<Roadmap>(`/roadmaps/${projectId}`)
  }

  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    return this.request<Roadmap>(`/roadmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/settings/notifications')
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async updateUserProfile(data: { name: string }): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

export const api = new ApiService()