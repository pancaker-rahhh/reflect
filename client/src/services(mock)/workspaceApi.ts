import { request } from './apiClient'
import type { Workspace } from '@/types'

export const workspaceApi = {
  getMyWorkspace(): Promise<Workspace> {
    return request<Workspace>('/workspaces/me')
  },
}
