import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  integrationsApi,
  type JiraConnectionTestRequest,
  type JiraConfigUpdate,
  type BulkJiraCreateRequest,
} from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export const useJiraConnectionTest = () => {
  return useMutation({
    mutationFn: (request: JiraConnectionTestRequest) => integrationsApi.testJiraConnection(request),
    onError: (error: any) => {
      console.error('JIRA connection test failed:', error)
    },
  })
}

export const useJiraProjects = (
  jira_url: string,
  auth_type: string,
  auth_data: any,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['jira-projects', jira_url, auth_type],
    queryFn: () => integrationsApi.getJiraProjects(jira_url, auth_type, auth_data),
    enabled: enabled && !!jira_url && !!auth_type,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export const useCreateJiraIntegration = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: any) => integrationsApi.createJiraIntegration(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast({
        title: 'JIRA Integration Created',
        description: 'Your JIRA integration has been successfully configured.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Integration Failed',
        description: error.message || 'Failed to create JIRA integration',
        variant: 'destructive',
      })
    },
  })
}

export const useJiraIntegration = (integrationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['jira-integration', integrationId],
    queryFn: () => integrationsApi.getJiraIntegration(integrationId),
    enabled: enabled && !!integrationId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateJiraIntegration = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ integrationId, config }: { integrationId: string; config: JiraConfigUpdate }) =>
      integrationsApi.updateJiraIntegration(integrationId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jira-integration', variables.integrationId] })
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast({
        title: 'Integration Updated',
        description: 'Your JIRA integration has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update JIRA integration',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteJiraIntegration = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (integrationId: string) => integrationsApi.deleteJiraIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast({
        title: 'Integration Deleted',
        description: 'Your JIRA integration has been successfully removed.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete JIRA integration',
        variant: 'destructive',
      })
    },
  })
}

export const useSyncFeatureToJira = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      featureId,
      jiraIntegrationId,
      forceSync = false,
      customConfig,
    }: {
      featureId: string
      jiraIntegrationId: string
      forceSync?: boolean
      customConfig?: {
        issue_type?: string
        priority?: string
        project_key?: string
      }
    }) => integrationsApi.syncFeatureToJira(featureId, jiraIntegrationId, forceSync, customConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      toast({
        title: 'Feature Synced',
        description: 'The feature has been successfully synced to JIRA.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync feature to JIRA',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkCreateJiraIssues = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: BulkJiraCreateRequest) => integrationsApi.bulkCreateJiraIssues(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      const { successful_count, failed_count } = data.data
      toast({
        title: 'Bulk Creation Complete',
        description: `${successful_count} issues created successfully${
          failed_count > 0 ? `, ${failed_count} failed` : ''
        }.`,
        variant: failed_count > 0 ? 'destructive' : 'default',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Creation Failed',
        description: error.message || 'Failed to create JIRA issues',
        variant: 'destructive',
      })
    },
  })
}

export const useIntegrationProjects = (integrationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['integration-projects', integrationId],
    queryFn: () => integrationsApi.getIntegrationProjects(integrationId),
    enabled: enabled && !!integrationId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useIntegrationIssueTypes = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-issue-types', integrationId],
    queryFn: () => integrationsApi.getIntegrationIssueTypes(integrationId),
    enabled: !!integrationId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useIntegrationPriorities = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-priorities', integrationId],
    queryFn: () => integrationsApi.getIntegrationPriorities(integrationId),
    enabled: !!integrationId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useIntegrationComponents = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-components', integrationId],
    queryFn: () => integrationsApi.getIntegrationComponents(integrationId),
    enabled: !!integrationId,
    staleTime: 5 * 60 * 1000,
  })
}
