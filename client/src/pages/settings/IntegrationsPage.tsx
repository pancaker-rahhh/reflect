import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Plus, Settings, Trash2, TestTube, CheckCircle } from 'lucide-react'
import { JiraIntegrationModal } from '@/components/integrations/JiraIntegrationModal'
import { JiraConfigureModal } from '@/components/integrations/JiraConfigureModal'
import { useDeleteJiraIntegration } from '@/hooks/useJiraIntegration'
import { useAppContext } from '@/context/AppContext'

export function IntegrationsPage() {
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false)
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const { currentProject } = useAppContext()

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', currentProject?.id],
    queryFn: () => api.getIntegrations(currentProject?.id),
    enabled: !!currentProject?.id,
  })

  const handleIntegrationUpdate = (updatedIntegration: any) => {
    setSelectedIntegration(updatedIntegration)
  }

  const deleteIntegration = useDeleteJiraIntegration()

  const jiraIntegrations = integrations.filter(
    (integration: any) => integration.integration_type?.toLowerCase() === 'jira'
  )

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      await deleteIntegration.mutateAsync(integrationId)
    } catch (error) {
      console.error('Failed to delete integration:', error)
    }
  }

  const getJiraDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace('.atlassian.net', '')
    } catch {
      return url
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h3>
        <p className="text-sm text-gray-600">
          Connect your Reflect project with external tools and services
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">JIRA Integration</h4>
                <p className="text-sm text-gray-600">
                  Convert action items to JIRA issues in your existing workflow
                </p>
              </div>
            </div>
            {jiraIntegrations.length === 0 && (
              <Button
                onClick={() => setIsJiraModalOpen(true)}
                disabled={!currentProject?.id}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect JIRA
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading integrations...</p>
            </div>
          ) : jiraIntegrations.length === 0 ? (
            <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
              <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">No JIRA connection</h4>
              <p className="text-sm text-gray-600 mb-4">
                Connect to JIRA to convert action items to issues in your existing workflow
              </p>
              <Button
                onClick={() => setIsJiraModalOpen(true)}
                disabled={!currentProject?.id}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect JIRA
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jiraIntegrations.map((integration: any) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">JIRA Connected</span>
                          <Badge variant="outline" className="text-xs">
                            {getJiraDomain(integration.config?.jira_url || '')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Ready to create issues in your JIRA projects
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIntegration(integration)
                          setIsConfigureModalOpen(true)
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id)}
                        disabled={deleteIntegration.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <TestTube className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Coming Soon</h4>
              <p className="text-sm text-gray-600">More integrations are on the way</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">T</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Trello</h5>
                  <p className="text-sm text-gray-600">Create Trello cards</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">
                  Soon
                </Badge>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xs">L</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Linear</h5>
                  <p className="text-sm text-gray-600">Create Linear issues</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">
                  Soon
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JiraIntegrationModal
        isOpen={isJiraModalOpen}
        onClose={() => setIsJiraModalOpen(false)}
        projectId={currentProject?.id || ''}
      />
      <JiraConfigureModal
        isOpen={isConfigureModalOpen}
        onClose={() => {
          setIsConfigureModalOpen(false)
          setSelectedIntegration(null)
        }}
        integration={selectedIntegration}
        onUpdate={handleIntegrationUpdate}
      />
    </div>
  )
}
