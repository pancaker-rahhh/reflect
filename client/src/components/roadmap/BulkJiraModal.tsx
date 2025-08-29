import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import {
  useBulkCreateJiraIssues,
  useIntegrationProjects,
  useIntegrationIssueTypes,
} from '@/hooks/useJiraIntegration'
import type { RoadmapActionItem } from '@/types'

interface BulkJiraModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: RoadmapActionItem[]
  jiraIntegrations: any[]
}

export function BulkJiraModal({
  isOpen,
  onClose,
  selectedItems,
  jiraIntegrations,
}: BulkJiraModalProps) {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('')
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('')
  const [issueType, setIssueType] = useState('Task')

  const bulkCreate = useBulkCreateJiraIssues()
  const projectsQuery = useIntegrationProjects(
    selectedIntegrationId,
    isOpen && !!selectedIntegrationId
  )
  const issueTypesQuery = useIntegrationIssueTypes(selectedIntegrationId)

  // Auto-select the first integration if only one exists
  useEffect(() => {
    if (jiraIntegrations.length === 1) {
      setSelectedIntegrationId(jiraIntegrations[0].id)
      // Only set default issue type if no issue type is currently selected
      if (!issueType || issueType === 'Task') {
        setIssueType(jiraIntegrations[0].config?.default_issue_type || 'Task')
      }
    }
  }, [jiraIntegrations, issueType])

  // Set issue type when issue types are loaded
  useEffect(() => {
    if (issueTypesQuery.data?.issue_types && issueTypesQuery.data.issue_types.length > 0) {
      console.log('Issue types loaded (bulk):', issueTypesQuery.data.issue_types)
      const selectedIntegration = jiraIntegrations.find((i) => i.id === selectedIntegrationId)
      if (selectedIntegration) {
        // Only set default issue type if current issue type is not in the available list
        const availableIssueTypes = issueTypesQuery.data.issue_types.map((t) => t.name)
        if (!availableIssueTypes.includes(issueType)) {
          const defaultIssueType = selectedIntegration.config?.default_issue_type
          if (defaultIssueType && availableIssueTypes.includes(defaultIssueType)) {
            setIssueType(defaultIssueType)
          } else if (availableIssueTypes.includes('Task')) {
            setIssueType('Task')
          } else {
            setIssueType(availableIssueTypes[0])
          }
        }
      }
    }
  }, [issueTypesQuery.data, selectedIntegrationId, jiraIntegrations]) // Removed issueType from dependencies to prevent infinite loops

  // Set the selected project when integration changes or projects are loaded
  useEffect(() => {
    if (selectedIntegrationId && projectsQuery.data?.projects) {
      const selectedIntegration = jiraIntegrations.find((i) => i.id === selectedIntegrationId)
      if (selectedIntegration) {
        // Only set default project if no project is currently selected
        if (!selectedProjectKey) {
          const defaultProjectKey = selectedIntegration.config?.default_project_key
          const firstProjectKey = projectsQuery.data.projects[0]?.key

          if (
            defaultProjectKey &&
            projectsQuery.data.projects.find((p) => p.key === defaultProjectKey)
          ) {
            setSelectedProjectKey(defaultProjectKey)
          } else if (firstProjectKey) {
            setSelectedProjectKey(firstProjectKey)
          }
        }
      }
    }
  }, [selectedIntegrationId, projectsQuery.data, jiraIntegrations, selectedProjectKey])

  const handleBulkCreate = async () => {
    if (!selectedIntegrationId || !selectedProjectKey) return

    const selectedIntegration = jiraIntegrations.find(
      (integration) => integration.id === selectedIntegrationId
    )
    if (!selectedIntegration) return

    const request = {
      action_item_ids: selectedItems.map((item) => item.id),
      jira_integration_id: selectedIntegrationId,
      jira_config: {
        project_key: selectedProjectKey,
        issue_type: issueType,
      },
    }

    await bulkCreate.mutateAsync(request)
  }

  const resetForm = () => {
    setSelectedIntegrationId('')
    setSelectedProjectKey('')
    setIssueType('Task')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedIntegration = selectedIntegrationId
    ? jiraIntegrations.find((i) => i.id === selectedIntegrationId)
    : null
  const projectName = projectsQuery.data?.projects?.find((p) => p.key === selectedProjectKey)?.name

  const getProjectDisplayName = (integration: any) => {
    if (!integration) return 'JIRA Project'

    const project = projectsQuery.data?.projects?.find(
      (p) => p.key === integration.config?.project_key
    )
    if (project) {
      return `${project.name} (${project.key})`
    }
    return integration.config?.project_key || 'JIRA Project'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Push {selectedItems.length} Action Items to JIRA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm font-medium text-gray-900">Selected Items</Label>
            </div>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {jiraIntegrations.length > 1 && (
              <div>
                <Label>JIRA Integration</Label>
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your JIRA integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {jiraIntegrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center gap-2">
                          <span>{integration.name || 'JIRA Integration'}</span>
                          {integration.config?.default_project_key && (
                            <Badge variant="outline" className="text-xs">
                              default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedIntegrationId && projectsQuery.data?.projects && (
              <div>
                <Label>Project</Label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsQuery.data.projects.map((project) => (
                      <SelectItem key={project.key} value={project.key}>
                        <div className="flex items-center gap-2">
                          <span>
                            {project.name} ({project.key})
                          </span>
                          {project.key === selectedIntegration?.config?.default_project_key && (
                            <Badge variant="outline" className="text-xs">
                              default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedIntegrationId && (
              <div>
                <Label>Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypesQuery.data?.issue_types
                      ? issueTypesQuery.data.issue_types.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            <div className="flex items-center gap-2">
                              <span>{type.name}</span>
                              {type.name === selectedIntegration?.config?.default_issue_type && (
                                <Badge variant="outline" className="text-xs">
                                  default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      : // Fallback to common issue types if API fails
                        ['Task', 'Story', 'Bug', 'Epic'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <span>{type}</span>
                              {type === selectedIntegration?.config?.default_issue_type && (
                                <Badge variant="outline" className="text-xs">
                                  default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {bulkCreate.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {bulkCreate.data.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bulk Creation Complete
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      Creation Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bulkCreate.data.success ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Successfully Created:</span>
                        <Badge variant="default" className="bg-green-500">
                          {bulkCreate.data.data.successful_count} issues
                        </Badge>
                      </div>
                      {bulkCreate.data.data.failed_count > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Failed:</span>
                          <Badge variant="destructive">
                            {bulkCreate.data.data.failed_count} issues
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Project:</span>
                        <span className="text-gray-600">
                          {projectName || getProjectDisplayName(selectedIntegration) || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Issue Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {issueType}
                        </Badge>
                      </div>
                    </div>

                    {bulkCreate.data.data.results?.some((r) => r.issue_url) && (
                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const firstIssueUrl = bulkCreate.data.data.results.find(
                              (r) => r.issue_url
                            )?.issue_url
                            if (firstIssueUrl) {
                              window.open(firstIssueUrl, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View in JIRA
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-red-600">{bulkCreate.data.message}</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleBulkCreate}
            disabled={!selectedIntegrationId || bulkCreate.isPending}
            className="flex-1"
          >
            {bulkCreate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating JIRA Issues...
              </>
            ) : (
              `Create ${selectedItems.length} JIRA Issues`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
