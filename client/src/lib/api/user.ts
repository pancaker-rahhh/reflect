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
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/me');
  }

  async syncUser(): Promise<User> {
    return this.post<User>('/users/sync');
  }

  async updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    return this.put<User>('/users/me', data);
  }

  async deleteAccount(): Promise<UserDeleteResponse> {
    return this.delete<UserDeleteResponse>('/users/me');
  }
}

export const userApi = new UserApiService();