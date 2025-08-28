import { apiClient } from '../client'
import { ApiException } from '../errors'

export interface JiraConnectionTestRequest {
  jira_url: string
  auth_type: 'api_token' | 'basic_auth' | 'oauth2'
  email?: string
  api_token?: string
  username?: string
  password?: string
  client_id?: string
  client_secret?: string
  authorization_code?: string
  redirect_uri?: string
}

export interface JiraConnectionTestResponse {
  success: boolean
  message: string
  user_info?: {
    account_id: string
    name: string
    email: string
    display_name: string
  }
  jira_version?: string
  details?: Record<string, any>
}

export interface JiraConfig {
  jira_url: string
  project_key: string
  default_issue_type: string
  default_priority: string
  status_mapping?: Record<string, string>
  auto_create_issues: boolean
  include_metadata: boolean
}

export interface JiraConfigUpdate {
  project_key?: string
  default_issue_type?: string
  default_priority?: string
  status_mapping?: Record<string, string>
  auto_create_issues?: boolean
  include_metadata?: boolean
}

export interface JiraProject {
  id: string
  key: string
  name: string
  project_type_key: string
  simplified: boolean
  avatar_url?: string
}

export interface JiraProjectsResponse {
  success: boolean
  projects: JiraProject[]
  total_count: number
  message: string
  cached?: boolean
}

export interface JiraIssueType {
  id: string
  name: string
  description?: string
  icon_url?: string
  subtask: boolean
}

export interface JiraIssueTypesResponse {
  success: boolean
  issue_types: JiraIssueType[]
  message: string
}

export interface JiraPriority {
  id: string
  name: string
  description?: string
  icon_url?: string
}

export interface JiraPrioritiesResponse {
  success: boolean
  priorities: JiraPriority[]
  message: string
}

export interface JiraComponent {
  id: string
  name: string
  description?: string
  lead?: {
    account_id: string
    name: string
    display_name: string
  }
}

export interface JiraComponentsResponse {
  success: boolean
  data: {
    components: JiraComponent[]
    total_count: number
  }
  message: string
  errors: string[]
}

export interface JiraIntegrationCreateRequest {
  project_id: string
  name: string
  jira_url: string
  auth_type: 'api_token' | 'basic_auth' | 'oauth2'
  auth_data: Record<string, any>
  config: Record<string, any>
}

export interface JiraIntegrationResponse {
  success: boolean
  data: {
    integration_id: string
    integration: any
  }
  message: string
  errors: string[]
}

export interface BulkJiraCreateRequest {
  action_item_ids: string[]
  jira_integration_id: string
  jira_config: {
    project_key: string
    issue_type: string
    priority?: string
    assignee?: string
    components?: string[]
  }
}

export interface BulkJiraCreateResponse {
  success: boolean
  data: {
    results: Array<{
      action_item_id: string
      issue_key?: string
      issue_url?: string
      status: 'success' | 'failed'
      error?: string
    }>
    total_requested: number
    successful_count: number
    failed_count: number
  }
  message: string
  errors: string[]
}

export const integrationsApi = {
  getIntegrations: async (projectId?: string): Promise<any[]> => {
    const params = projectId ? `?project_id=${projectId}` : ''
    return apiClient.get<any[]>(`/integrations${params}`)
  },

  testJiraConnection: async (
    request: JiraConnectionTestRequest
  ): Promise<JiraConnectionTestResponse> => {
    return apiClient.post<JiraConnectionTestResponse>('/integrations/jira/test-connection', request)
  },

  getJiraProjects: async (
    jira_url: string,
    auth_type: string,
    auth_data: any
  ): Promise<JiraProjectsResponse> => {
    const params = new URLSearchParams({
      jira_url,
      auth_type,
      ...auth_data,
    })
    return apiClient.get<JiraProjectsResponse>(`/integrations/jira/discover/projects?${params}`)
  },

  createJiraIntegration: async (
    request: JiraIntegrationCreateRequest
  ): Promise<JiraIntegrationResponse> => {
    return apiClient.post<JiraIntegrationResponse>('/integrations/jira', request)
  },

  getJiraIntegration: async (integrationId: string): Promise<any> => {
    return apiClient.get<any>(`/integrations/jira/${integrationId}`)
  },

  updateJiraIntegration: async (integrationId: string, config: JiraConfigUpdate): Promise<any> => {
    return apiClient.put<any>(`/integrations/jira/${integrationId}`, { config_update: config })
  },

  deleteJiraIntegration: async (integrationId: string): Promise<any> => {
    return apiClient.delete<any>(`/integrations/jira/${integrationId}`)
  },

  getIntegrationProjects: async (
    integrationId: string,
    force_refresh?: boolean
  ): Promise<JiraProjectsResponse> => {
    const params = force_refresh ? '?force_refresh=true' : ''
    return apiClient.get<JiraProjectsResponse>(
      `/integrations/jira/${integrationId}/projects${params}`
    )
  },

  getIntegrationIssueTypes: async (integrationId: string): Promise<JiraIssueTypesResponse> => {
    return apiClient.get<JiraIssueTypesResponse>(`/integrations/jira/${integrationId}/issue-types`)
  },

  getIntegrationPriorities: async (integrationId: string): Promise<JiraPrioritiesResponse> => {
    return apiClient.get<JiraPrioritiesResponse>(`/integrations/jira/${integrationId}/priorities`)
  },

  getIntegrationComponents: async (integrationId: string): Promise<JiraComponentsResponse> => {
    return apiClient.get<JiraComponentsResponse>(`/integrations/jira/${integrationId}/components`)
  },

  bulkCreateJiraIssues: async (request: BulkJiraCreateRequest): Promise<BulkJiraCreateResponse> => {
    return apiClient.post<BulkJiraCreateResponse>('/roadmap/features/bulk-jira', request)
  },

  syncFeatureToJira: async (
    featureId: string,
    jiraIntegrationId: string,
    forceSync: boolean = false,
    customConfig?: {
      issue_type?: string
      priority?: string
    }
  ): Promise<any> => {
    return apiClient.post<any>(`/roadmap-enhanced/roadmap/features/${featureId}/jira/sync`, {
      jira_integration_id: jiraIntegrationId,
      force_sync: forceSync,
      custom_config: customConfig,
    })
  },
}
