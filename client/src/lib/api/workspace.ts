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
  async getWorkspaces(): Promise<Workspace[]> {
    return this.get<Workspace[]>('/workspaces');
  }

  async getWorkspace(id: string): Promise<Workspace> {
    return this.get<Workspace>(`/workspaces/${id}`);
  }

  async createWorkspace(data: WorkspaceCreateRequest): Promise<Workspace> {
    return this.post<Workspace>('/workspaces', data);
  }

  async updateWorkspace(id: string, data: WorkspaceUpdateRequest): Promise<Workspace> {
    return this.put<Workspace>(`/workspaces/${id}`, data);
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.delete<void>(`/workspaces/${id}`);
  }

  async switchWorkspace(workspaceId: string): Promise<User> {
    return this.put<User>('/users/current-workspace', { workspace_id: workspaceId });
  }
}

export const workspaceApi = new WorkspaceApiService();