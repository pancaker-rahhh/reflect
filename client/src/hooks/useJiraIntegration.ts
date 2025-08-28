import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  integrationsApi,
  type JiraConnectionTestRequest,
  type JiraConfig,
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
    onSuccess: (data) => {
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
    onSuccess: (data, variables) => {
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
        title: 'Integration Removed',
        description: 'Your JIRA integration has been successfully removed.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Removal Failed',
        description: error.message || 'Failed to remove JIRA integration',
        variant: 'destructive',
      })
    },
  })
}

export const useIntegrationProjects = (integrationId: string, force_refresh?: boolean) => {
  return useQuery({
    queryKey: ['integration-projects', integrationId, force_refresh],
    queryFn: () => integrationsApi.getIntegrationProjects(integrationId, force_refresh),
    enabled: !!integrationId,
    staleTime: 10 * 60 * 1000,
  })
}

export const useIntegrationIssueTypes = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-issue-types', integrationId],
    queryFn: () => integrationsApi.getIntegrationIssueTypes(integrationId),
    enabled: !!integrationId,
    staleTime: 30 * 60 * 1000,
  })
}

export const useIntegrationPriorities = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-priorities', integrationId],
    queryFn: () => integrationsApi.getIntegrationPriorities(integrationId),
    enabled: !!integrationId,
    staleTime: 30 * 60 * 1000,
  })
}

export const useIntegrationComponents = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-components', integrationId],
    queryFn: () => integrationsApi.getIntegrationComponents(integrationId),
    enabled: !!integrationId,
    staleTime: 30 * 60 * 1000,
  })
}

export const useBulkCreateJiraIssues = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: BulkJiraCreateRequest) => integrationsApi.bulkCreateJiraIssues(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap-features'] })

      const { successful_count, failed_count } = data.data
      if (successful_count > 0) {
        toast({
          title: 'JIRA Issues Created',
          description: `Successfully created ${successful_count} JIRA issue${
            successful_count > 1 ? 's' : ''
          }.`,
        })
      }
      if (failed_count > 0) {
        toast({
          title: 'Some Issues Failed',
          description: `${failed_count} issue${
            failed_count > 1 ? 's' : ''
          } failed to create. Check the details for more information.`,
          variant: 'destructive',
        })
      }
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

export const useSyncFeatureToJira = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      featureId,
      jiraIntegrationId,
      forceSync,
    }: {
      featureId: string
      jiraIntegrationId: string
      forceSync?: boolean
    }) => integrationsApi.syncFeatureToJira(featureId, jiraIntegrationId, forceSync),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap-features'] })

      if (data.success) {
        toast({
          title: 'JIRA Issue Created',
          description: `Successfully created JIRA issue: ${data.data.issue_key}`,
        })
      } else {
        toast({
          title: 'JIRA Creation Failed',
          description: data.message || 'Failed to create JIRA issue',
          variant: 'destructive',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'JIRA Creation Failed',
        description: error.message || 'Failed to create JIRA issue',
        variant: 'destructive',
      })
    },
  })
}
