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
import type { RoadmapActionItem, Integration } from '@/types'

interface BulkJiraModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: RoadmapActionItem[]
  jiraIntegrations: Integration[]
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

  useEffect(() => {
    if (jiraIntegrations.length === 1) {
      setSelectedIntegrationId(jiraIntegrations[0].id)
      if (!issueType || issueType === 'Task') {
        setIssueType(jiraIntegrations[0].config?.default_issue_type || 'Task')
      }
    }
  }, [jiraIntegrations, issueType])

  useEffect(() => {
    if (issueTypesQuery.data?.issue_types && issueTypesQuery.data.issue_types.length > 0) {
      console.log('Issue types loaded (bulk):', issueTypesQuery.data.issue_types)
      const selectedIntegration = jiraIntegrations.find((i) => i.id === selectedIntegrationId)
      if (selectedIntegration) {
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
  }, [issueTypesQuery.data, selectedIntegrationId, jiraIntegrations])

  useEffect(() => {
    if (selectedIntegrationId && projectsQuery.data?.projects) {
      const selectedIntegration = jiraIntegrations.find((i) => i.id === selectedIntegrationId)
      if (selectedIntegration) {
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

  const getProjectDisplayName = (integration: Integration) => {
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
          <DialogTitle className="flex items-center gap-3">
            <ExternalLink className="h-6 w-6 text-info" />
            <span className="text-lg font-semibold">
              Push {selectedItems.length} Action Items to JIRA
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-surface-2 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm font-semibold text-foreground">Selected Items</Label>
              <Badge variant="outline" className="text-xs">
                {selectedItems.length} items
              </Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-tertiary rounded-lg border border-border shadow-sm"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {jiraIntegrations.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">JIRA Integration</Label>
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger className="h-11">
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

            {selectedIntegrationId && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Project</Label>
                {projectsQuery.isLoading ? (
                  <div className="h-11 bg-muted rounded-md animate-pulse"></div>
                ) : (
                  <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsQuery.data?.projects?.map((project) => (
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
                )}
              </div>
            )}

            {selectedIntegrationId && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Issue Type</Label>
                {issueTypesQuery.isLoading ? (
                  <div className="h-11 bg-muted rounded-md animate-pulse"></div>
                ) : (
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger className="h-11">
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
                        : ['Task', 'Story', 'Bug', 'Epic'].map((type) => (
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
                )}
              </div>
            )}
          </div>

          {bulkCreate.data && (
            <Card
              className={
                bulkCreate.data.success
                  ? 'border-success/20 bg-success/10'
                  : 'border-destructive/20 bg-destructive/10'
              }
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  {bulkCreate.data.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-success">Bulk Creation Complete</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive">Creation Failed</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bulkCreate.data.success ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">
                          Successfully Created:
                        </span>
                        <Badge variant="default" className="bg-green-600 text-white px-3 py-1">
                          {bulkCreate.data.data.successful_count} issues
                        </Badge>
                      </div>
                      {bulkCreate.data.data.failed_count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-700">Failed:</span>
                          <Badge variant="destructive" className="px-3 py-1">
                            {bulkCreate.data.data.failed_count} issues
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">Project:</span>
                        <span className="text-gray-600 text-sm">
                          {projectName ||
                            (selectedIntegration
                              ? getProjectDisplayName(selectedIntegration)
                              : 'Unknown')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">Issue Type:</span>
                        <Badge variant="outline" className="text-xs border-gray-300">
                          {issueType}
                        </Badge>
                      </div>
                    </div>

                    {bulkCreate.data.data.results?.some((r) => r.issue_url) && (
                      <div className="pt-3 border-t border-green-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-green-300 text-green-700 hover:bg-green-100"
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
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Failed to Create JIRA Issues</h4>
                        <p className="text-sm text-red-700 mt-1">{bulkCreate.data.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} className="flex-1 h-11">
            Cancel
          </Button>
          <Button
            onClick={handleBulkCreate}
            disabled={!selectedIntegrationId || !selectedProjectKey || bulkCreate.isPending}
            className="flex-1 h-11"
          >
            {bulkCreate.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating JIRA Issues...</span>
              </div>
            ) : (
              `Create ${selectedItems.length} JIRA Issues`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
