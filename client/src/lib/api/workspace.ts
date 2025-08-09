import { BaseApiService } from './base';
import type { Workspace, User } from '@/types';

export interface WorkspaceCreateRequest {
  name: string;
  description?: string;
}

export interface WorkspaceUpdateRequest {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
}

export class WorkspaceApiService extends BaseApiService {
  /**
   * Get all user's workspaces
   */
  async getWorkspaces(): Promise<Workspace[]> {
    return this.get<Workspace[]>('/workspaces');
  }

  /**
   * Get specific workspace by ID
   */
  async getWorkspace(id: string): Promise<Workspace> {
    return this.get<Workspace>(`/workspaces/${id}`);
  }

  /**
   * Create new workspace
   */
  async createWorkspace(data: WorkspaceCreateRequest): Promise<Workspace> {
    return this.post<Workspace>('/workspaces', data);
  }

  /**
   * Update workspace
   */
  async updateWorkspace(id: string, data: WorkspaceUpdateRequest): Promise<Workspace> {
    return this.put<Workspace>(`/workspaces/${id}`, data);
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    return this.delete<void>(`/workspaces/${id}`);
  }

  /**
   * Switch current active workspace
   */
  async switchWorkspace(workspaceId: string): Promise<User> {
    return this.put<User>('/users/current-workspace', { workspace_id: workspaceId });
  }
}

// Export singleton instance
export const workspaceApi = new WorkspaceApiService();