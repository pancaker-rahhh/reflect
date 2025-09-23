import type { User, Organization, Widget } from '@/types'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'http://localhost:8000/api/v1'

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
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
      method: 'POST',
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

  async deleteProject(_id: string): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 500))
  }

  async createWidget(widget: Omit<Widget, 'id' | 'created_at' | 'updated_at'>): Promise<Widget> {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ...widget,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        500
      )
    )
  }

  async deleteWidget(_id: string): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 500))
  }

  async updateUserProfile(data: { name: string }): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiService()
