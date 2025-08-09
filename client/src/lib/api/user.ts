import { BaseApiService } from './base';
import type { User } from '@/types';

export interface UserProfileUpdateRequest {
  name?: string;
  company_name?: string;
  phone?: string;
  timezone?: string;
  avatar_url?: string;
}

export interface UserDeleteResponse {
  message: string;
  deleted_at: string;
  gdpr_note: string;
}

export class UserApiService extends BaseApiService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/me');
  }

  /**
   * Sync user from Supabase to backend database
   */
  async syncUser(): Promise<User> {
    return this.post<User>('/users/sync');
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    return this.put<User>('/users/me', data);
  }

  /**
   * Delete current user account (soft delete)
   */
  async deleteAccount(): Promise<UserDeleteResponse> {
    return this.delete<UserDeleteResponse>('/users/me');
  }
}

// Export singleton instance
export const userApi = new UserApiService();