import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { useIntegrationProjects, useUpdateJiraIntegration } from '@/hooks/useJiraIntegration'
import type { Integration } from '@/types'

interface JiraConfigureModalProps {
  isOpen: boolean
  onClose: () => void
  integration: Integration
  onUpdate?: (updatedIntegration: Integration) => void
}

export function JiraConfigureModal({
  isOpen,
  onClose,
  integration,
  onUpdate,
}: JiraConfigureModalProps) {
  const [jiraUrl, setJiraUrl] = useState('')
  const [email, setEmail] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [showApiToken, setShowApiToken] = useState(false)
  const [defaultProject, setDefaultProject] = useState<string>('none')

  const projectsQuery = useIntegrationProjects(integration?.id, isOpen)
  const updateIntegration = useUpdateJiraIntegration()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (integration && isOpen) {
      setJiraUrl(integration.config?.jira_url || (integration.config as any)?.base_url || '')
      setEmail((integration.auth_data as any)?.username || '')
      setApiToken((integration.auth_data as any)?.api_token || '')
      const savedDefaultProject =
        integration.config?.default_project_key || integration.config?.project_key
      setDefaultProject(savedDefaultProject || 'none')
    }
  }, [integration, isOpen])

  const handleUpdateIntegration = async () => {
    if (!integration) return

    const selectedProjectKey = defaultProject === 'none' ? undefined : defaultProject

    const result = await updateIntegration.mutateAsync({
      integrationId: integration.id,
      config: {
        base_url: jiraUrl,
        jira_url: jiraUrl,
        default_project_key: selectedProjectKey,
        project_key: selectedProjectKey,
      },
    })

    if (result?.data?.integration && onUpdate) {
      onUpdate(result.data.integration)
    }

    queryClient.invalidateQueries({ queryKey: ['integrations'] })
    queryClient.invalidateQueries({ queryKey: ['jira-integration', integration.id] })
  }

  const resetForm = () => {
    setJiraUrl('')
    setEmail('')
    setApiToken('')
    setShowApiToken(false)
    setDefaultProject('none')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure JIRA Integration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>JIRA Instance URL</Label>
              <Input
                type="url"
                value={jiraUrl}
                onChange={(e) => setJiraUrl(e.target.value)}
                placeholder="https://your-company.atlassian.net"
              />
              <p className="text-sm text-gray-600 mt-1">Your JIRA instance URL</p>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@company.com"
                disabled
              />
              <p className="text-sm text-gray-600 mt-1">Your JIRA account email address</p>
            </div>

            <div>
              <Label>API Token</Label>
              <div className="relative">
                <Input
                  type={showApiToken ? 'text' : 'password'}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Enter your JIRA API token"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiToken(!showApiToken)}
                >
                  {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Your JIRA API token (not your password)</p>
            </div>

            <div>
              <Label>Default Project (Optional)</Label>
              <Select
                value={defaultProject}
                onValueChange={setDefaultProject}
                disabled={projectsQuery.isLoading || projectsQuery.isError}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a default project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default</SelectItem>
                  {projectsQuery.data?.projects?.map((project) => (
                    <SelectItem key={project.key} value={project.key}>
                      {project.name} ({project.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projectsQuery.isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <p className="text-sm text-blue-600">Loading JIRA projects...</p>
                </div>
              )}
              {projectsQuery.isError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium">Failed to load projects</p>
                      <p className="text-xs text-red-600 mt-1">
                        {projectsQuery.error?.message ||
                          'Your API token may have expired or JIRA credentials are invalid. Please check your connection and try re-creating the integration.'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => projectsQuery.refetch()}
                    className="mt-2 w-full"
                  >
                    Retry Loading Projects
                  </Button>
                </div>
              )}
              {!projectsQuery.isLoading &&
                !projectsQuery.isError &&
                projectsQuery.data?.projects?.length === 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-medium">No projects found</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Your API token might have expired or you don't have access to any JIRA
                      projects. Try re-creating the integration with a fresh token.
                    </p>
                  </div>
                )}
              {!projectsQuery.isLoading &&
                !projectsQuery.isError &&
                defaultProject !== 'none' &&
                projectsQuery.data?.projects &&
                projectsQuery.data.projects.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Default project:{' '}
                    {projectsQuery.data.projects.find((p) => p.key === defaultProject)?.name ||
                      defaultProject}
                  </p>
                )}
              {!projectsQuery.isError && (
                <p className="text-sm text-gray-600 mt-1">
                  You can always choose the project when creating issues
                </p>
              )}
            </div>
          </div>

          {updateIntegration.data && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                {updateIntegration.data.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Configuration updated successfully!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{updateIntegration.data.message}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateIntegration}
            disabled={updateIntegration.isPending}
            className="flex-1"
          >
            {updateIntegration.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
