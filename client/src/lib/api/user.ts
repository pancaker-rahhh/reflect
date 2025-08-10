import { apiClient } from '../client'
import type { User } from '@/types'

export interface UserProfileUpdateRequest {
  name?: string
  company_name?: string
  phone?: string
  timezone?: string
  avatar_url?: string
}

export interface UserDeleteResponse {
  message: string
  deleted_at: string
  gdpr_note: string
}

export const userApi = {
  getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me')
  },

  syncUser(): Promise<User> {
    return apiClient.post<User>('/users/sync')
  },

  updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    return apiClient.put<User>('/users/me', data)
  },

  deleteAccount(): Promise<UserDeleteResponse> {
    return apiClient.delete<UserDeleteResponse>('/users/me')
  }
}