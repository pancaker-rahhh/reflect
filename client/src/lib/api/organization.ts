import { apiClient } from '../client'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

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
  user_id?: string  // Optional for pending members
  organization_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  email?: string
  name?: string
  created_at: string
  updated_at?: string
  is_pending?: boolean  // True for invited but not accepted members
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
    apiClient.get<OrganizationListResponse>(`/organizations?skip=${skip}&limit=${limit}`),

  /**
   * Get simplified list of user's organizations
   */
  getMy: (): Promise<Organization[]> =>
    apiClient.get<Organization[]>('/organizations/my'),

  /**
   * Get organization by ID
   */
  getById: (id: string, includeMembers = false): Promise<Organization> =>
    apiClient.get<Organization>(`/organizations/${id}?include_members=${includeMembers}`),

  /**
   * Create new organization
   */
  create: (data: OrganizationCreateRequest): Promise<Organization> =>
    apiClient.post<Organization>('/organizations', data),

  /**
   * Update organization
   */
  update: (id: string, data: OrganizationUpdateRequest): Promise<Organization> =>
    apiClient.put<Organization>(`/organizations/${id}`, data),

  /**
   * Delete organization
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${id}`),

  /**
   * Get organization members
   */
  getMembers: (orgId: string, skip = 0, limit = 50): Promise<OrganizationMember[]> =>
    apiClient.get<OrganizationMember[]>(`/organizations/${orgId}/members?skip=${skip}&limit=${limit}`),

  /**
   * Invite member to organization
   */
  inviteMember: (orgId: string, invitation: InvitationRequest): Promise<OrganizationMember> =>
    apiClient.post<OrganizationMember>(`/organizations/${orgId}/members`, invitation),

  /**
   * Update member role
   */
  updateMember: (orgId: string, memberId: string, data: { role: string }): Promise<OrganizationMember> =>
    apiClient.put<OrganizationMember>(`/organizations/${orgId}/members/${memberId}`, data),

  /**
   * Remove member from organization
   */
  removeMember: (orgId: string, memberId: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${orgId}/members/${memberId}`),

  /**
   * Leave organization
   */
  leave: (orgId: string): Promise<void> =>
    apiClient.post<void>(`/organizations/${orgId}/leave`),
}

export const invitationApi = {
  /**
   * Send bulk invitations
   */
  sendBulk: (data: BulkInvitationRequest): Promise<void> =>
    apiClient.post<void>('/invitations/bulk', data),
}