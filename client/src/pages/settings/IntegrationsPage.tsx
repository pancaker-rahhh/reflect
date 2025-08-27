import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Plus, Settings, Trash2, TestTube } from 'lucide-react'
import { JiraIntegrationModal } from '@/components/integrations/JiraIntegrationModal'
import { useDeleteJiraIntegration } from '@/hooks/useJiraIntegration'
import { useToast } from '@/components/ui/use-toast'

export function IntegrationsPage() {
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false)
  const { toast } = useToast()

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.getIntegrations(),
  })

  const deleteIntegration = useDeleteJiraIntegration()

  const jiraIntegrations = integrations.filter((integration: any) => integration.type === 'JIRA')

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      await deleteIntegration.mutateAsync(integrationId)
    } catch (error) {
      console.error('Failed to delete integration:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your Reflect project with external tools and services
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">JIRA Integration</CardTitle>
                  <CardDescription>
                    Automatically create JIRA issues from your action items
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setIsJiraModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Connect JIRA
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading integrations...</p>
              </div>
            ) : jiraIntegrations.length === 0 ? (
              <div className="text-center py-8">
                <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No JIRA integrations</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your JIRA instance to automatically create issues from action items
                </p>
                <Button onClick={() => setIsJiraModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect JIRA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jiraIntegrations.map((integration: any) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {integration.config?.jira_url || 'JIRA Integration'}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {integration.config?.project_key || 'No Project'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Project: {integration.config?.project_key} • Issue Type:{' '}
                          {integration.config?.default_issue_type || 'Task'} • Priority:{' '}
                          {integration.config?.default_priority || 'Medium'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id)}
                        disabled={deleteIntegration.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TestTube className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Coming Soon</CardTitle>
                <CardDescription>More integrations are on the way</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">T</span>
                </div>
                <div>
                  <h4 className="font-medium">Trello</h4>
                  <p className="text-sm text-muted-foreground">Create Trello cards</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Soon
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">L</span>
                </div>
                <div>
                  <h4 className="font-medium">Linear</h4>
                  <p className="text-sm text-muted-foreground">Create Linear issues</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <JiraIntegrationModal
        isOpen={isJiraModalOpen}
        onClose={() => setIsJiraModalOpen(false)}
        projectId=""
      />
    </div>
  )
}
