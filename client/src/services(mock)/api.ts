import type {
  User,
  Organization,
  Project,
  Widget,
  Feedback,
  DashboardMetrics,
  RecentActivity,
  NotificationSettings,
  Roadmap
} from '@/types'
import { supabase } from '../lib/supabase'
import { mockData } from '@/mocks/data'

const API_BASE_URL = 'http://localhost:8000/api/v1'

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers
      }
    })

    if (response.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me')
  }

  async syncUser(): Promise<User> {
    return this.request<User>('/users/sync', {
      method: 'POST'
    })
  }

  // Organizations - REAL API CALLS
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.request<{ organizations: Organization[] }>('/organizations')
    return response.organizations || []
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`)
  }

  // Projects - MOCKED (not implemented in backend yet)
  async getProjects(): Promise<Project[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.projects), 500))
  }

  async getProject(id: string): Promise<Project> {
    return new Promise(resolve => setTimeout(() => 
      resolve(mockData.projects.find(p => p.id === id) || mockData.projects[0]), 500))
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return new Promise(resolve => setTimeout(() => 
      resolve({ ...mockData.projects[0], ...data }), 500))
  }

  async deleteProject(id: string): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), 500))
  }

  // Widgets - MOCKED (not implemented in backend yet)
  async getWidgets(): Promise<Widget[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.widgets), 500))
  }

  async createWidget(widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget> {
    return new Promise(resolve => setTimeout(() => 
      resolve({ ...widget, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }), 500))
  }

  async updateWidget(id: string, data: Partial<Widget>): Promise<Widget> {
    return new Promise(resolve => setTimeout(() => 
      resolve({ ...mockData.widgets[0], ...data }), 500))
  }

  async deleteWidget(id: string): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), 500))
  }

  // Dashboard - MOCKED (not implemented in backend yet)
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.dashboardMetrics), 500))
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.recentActivity), 500))
  }

  // Feedback - MOCKED (not implemented in backend yet)
  async getFeedback(filters?: {
    type?: string
    startDate?: Date
    endDate?: Date
    score?: number
  }): Promise<Feedback[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.feedback), 500))
  }

  // Reviews - MOCKED (not implemented in backend yet)
  async getReviews(): Promise<Feedback[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.feedback.filter(f => f.type === 'review')), 500))
  }

  // Feature Requests - MOCKED (not implemented in backend yet)
  async upvoteFeature(featureId: string): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), 500))
  }

  // Roadmap - MOCKED (not implemented in backend yet)
  async getRoadmap(projectId: string): Promise<Roadmap> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.roadmaps[0]), 500))
  }

  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    return new Promise(resolve => setTimeout(() => resolve({ ...mockData.roadmaps[0], ...data }), 500))
  }

  // Settings - MOCKED (not implemented in backend yet)
  async getNotificationSettings(): Promise<NotificationSettings> {
    return new Promise(resolve => setTimeout(() => resolve(mockData.notificationSettings), 500))
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    return new Promise(resolve => setTimeout(() => resolve(settings), 500))
  }

  async updateUserProfile(data: { name: string }): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

export const api = new ApiService()