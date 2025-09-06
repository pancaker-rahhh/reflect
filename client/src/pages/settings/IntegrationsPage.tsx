import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { ExternalLink, Plus, Settings, Trash2, TestTube, CheckCircle, Loader2 } from 'lucide-react'
import { JiraIntegrationModal } from '@/components/integrations/JiraIntegrationModal'
import { JiraConfigureModal } from '@/components/integrations/JiraConfigureModal'
import { useDeleteJiraIntegration } from '@/hooks/useJiraIntegration'
import { useAppContext } from '@/context/AppContext'
import { useSubscription } from '@/hooks/useSubscription'
import { FeatureGateWithDisabledState } from '@/components/common/FeatureGateWithDisabledState'
import { ProFeatureBadge } from '@/components/common/ProFeatureBadge'
import type { Integration } from '@/types'

export function IntegrationsPage() {
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false)
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const { currentProject } = useAppContext()
  const { isFeatureEnabled } = useSubscription()

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', currentProject?.id],
    queryFn: () => api.getIntegrations(currentProject?.id),
    enabled: !!currentProject?.id,
  })

  const handleIntegrationUpdate = (updatedIntegration: Integration) => {
    setSelectedIntegration(updatedIntegration)
  }

  const deleteIntegration = useDeleteJiraIntegration()

  const jiraIntegrations = integrations.filter(
    (integration: Integration) => integration.integration_type?.toLowerCase() === 'jira'
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
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrations</h3>
        <p className="text-gray-600">
          Connect your Reflect project with external tools and services
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">JIRA Integration</h4>
                  <ProFeatureBadge feature="jira_integration" />
                </div>
                <p className="text-gray-600">
                  Convert action items to JIRA issues in your existing workflow
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-lg font-medium text-gray-900">Loading integrations...</span>
              </div>
              <p className="text-gray-600">Discovering your connected services</p>
            </div>
          ) : jiraIntegrations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No JIRA connection</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect to JIRA to convert action items to issues in your existing workflow
              </p>
              <div className="flex justify-center">
                <FeatureGateWithDisabledState feature="jira_integration">
                  <Button
                    onClick={() => setIsJiraModalOpen(true)}
                    disabled={!currentProject?.id}
                    size="sm"
                    className="h-10 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect JIRA
                  </Button>
                </FeatureGateWithDisabledState>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jiraIntegrations.map((integration: Integration) => (
                <div
                  key={integration.id}
                  className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-semibold text-gray-900">
                            JIRA Connected
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs border-green-300 text-green-700"
                          >
                            {getJiraDomain(integration.config?.jira_url || '')}
                          </Badge>
                        </div>
                        <p className="text-gray-600">
                          Ready to create issues in your JIRA projects
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIntegration(integration)
                          setIsConfigureModalOpen(true)
                        }}
                        className="h-9 px-4"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id)}
                        disabled={deleteIntegration.isPending}
                        className="h-9 px-3"
                      >
                        {deleteIntegration.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <TestTube className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Coming Soon</h4>
              <p className="text-gray-600">More integrations are on the way</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">T</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">Trello</h5>
                  <p className="text-gray-600">Create Trello cards</p>
                </div>
                <Badge variant="outline" className="text-xs border-gray-300">
                  Soon
                </Badge>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">L</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">Linear</h5>
                  <p className="text-gray-600">Create Linear issues</p>
                </div>
                <Badge variant="outline" className="text-xs border-gray-300">
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
      {selectedIntegration && (
        <JiraConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={() => {
            setIsConfigureModalOpen(false)
            setSelectedIntegration(null)
          }}
          integration={selectedIntegration}
          onUpdate={handleIntegrationUpdate}
        />
      )}
    </div>
  )
}
