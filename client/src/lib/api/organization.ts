import { apiClient } from '../client'
import type { Organization } from '@/types'

export interface OrganizationCreateRequest {
  name: string
  description?: string
  slug?: string
}

export interface OrganizationUpdateRequest {
  name?: string
  description?: string
  slug?: string
}

export interface OrganizationListResponse {
  organizations: Organization[]
  total: number
  skip: number
  limit: number
}

export interface OrganizationMember {
  id: string
  user_id?: string // Optional for pending members
  organization_id?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  user_name?: string
  user_email?: string
  created_at: string
  updated_at?: string
  is_pending?: boolean // True for invited but not accepted members
}

export interface InvitationRequest {
  email: string
  role: 'admin' | 'member' | 'viewer'
}

export interface BulkInvitationRequest {
  invitations: InvitationRequest[]
}

export const organizationApi = {
  /**
   * Get all organizations for current user
   */
  getAll: (skip = 0, limit = 50): Promise<OrganizationListResponse> =>
    apiClient.get<OrganizationListResponse>(`/organizations/?skip=${skip}&limit=${limit}`),

  /**
   * Get simplified list of user's organizations
   */
  async getMy(): Promise<Organization[]> {
    const response = await apiClient.get<OrganizationListResponse>('/organizations/')
    return response?.organizations || []
  },

  /**
   * Send bulk invitations
   */
  sendBulk: (request: BulkInvitationRequest): Promise<any> =>
    apiClient.post('/organizations/bulk-invite', request),

  /**
   * Get current user's organization (newer method)
   */
  async getMyOrganization(): Promise<Organization | null> {
    const response = await apiClient.get<OrganizationListResponse>('/organizations/?limit=1')

    if (response && response.organizations && response.organizations.length > 0) {
      return response.organizations[0]
    }

    return null
  },

  /**
   * Get organization by ID
   */
  getById: (id: string, includeMembers = false): Promise<Organization> =>
    apiClient.get<Organization>(`/organizations/${id}?include_members=${includeMembers}`),

  /**
   * Create new organization
   */
  create: (data: OrganizationCreateRequest): Promise<Organization> =>
    apiClient.post<Organization>('/organizations/', data),

  /**
   * Update organization
   */
  update: (id: string, data: OrganizationUpdateRequest): Promise<Organization> =>
    apiClient.put<Organization>(`/organizations/${id}`, data),

  /**
   * Delete organization
   */
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/organizations/${id}`),

  /**
   * Get organization members
   */
  getMembers: (orgId: string, skip = 0, limit = 50): Promise<OrganizationMember[]> =>
    apiClient.get<OrganizationMember[]>(
      `/organizations/${orgId}/members?skip=${skip}&limit=${limit}`
    ),

  /**
   * Invite member to organization
   */
  inviteMember: (orgId: string, invitation: InvitationRequest): Promise<OrganizationMember> =>
    apiClient.post<OrganizationMember>(`/organizations/${orgId}/members`, invitation),

  /**
   * Update member role
   */
  updateMember: (
    orgId: string,
    memberId: string,
    data: { role: string }
  ): Promise<OrganizationMember> =>
    apiClient.put<OrganizationMember>(`/organizations/${orgId}/members/${memberId}`, data),

  /**
   * Remove member from organization
   */
  removeMember: (orgId: string, memberId: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${orgId}/members/${memberId}`),

  /**
   * Leave organization
   */
  leave: (orgId: string): Promise<void> => apiClient.post<void>(`/organizations/${orgId}/leave`),
}

export const invitationApi = {
  /**
   * Send bulk invitations
   */
  sendBulk: (data: BulkInvitationRequest): Promise<void> =>
    apiClient.post<void>('/invitations/bulk', data),
}
