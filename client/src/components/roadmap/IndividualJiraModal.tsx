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
  useSyncFeatureToJira,
  useIntegrationProjects,
  useIntegrationIssueTypes,
} from '@/hooks/useJiraIntegration'
import type { RoadmapActionItem, Integration } from '@/types'

interface IndividualJiraModalProps {
  isOpen: boolean
  onClose: () => void
  feature: RoadmapActionItem
  jiraIntegrations: Integration[]
}

export function IndividualJiraModal({
  isOpen,
  onClose,
  feature,
  jiraIntegrations,
}: IndividualJiraModalProps) {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('')
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('')
  const [issueType, setIssueType] = useState('Task')

  const syncToJira = useSyncFeatureToJira()
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

  useEffect(() => {
    if (issueTypesQuery.data?.issue_types && issueTypesQuery.data.issue_types.length > 0) {
      console.log('Issue types loaded:', issueTypesQuery.data.issue_types)
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

  const handleConvertToJira = async () => {
    if (!selectedIntegrationId || !selectedProjectKey) return

    const selectedIntegration = jiraIntegrations.find(
      (integration) => integration.id === selectedIntegrationId
    )
    if (!selectedIntegration) return

    await syncToJira.mutateAsync({
      featureId: feature.id,
      jiraIntegrationId: selectedIntegrationId,
      forceSync: false,
      customConfig: {
        issue_type: issueType,
        project_key: selectedProjectKey,
      },
    })
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {feature.jira_integration ? (
              <>
                <CheckCircle className="h-6 w-6" style={{ color: 'hsl(var(--tint-success))' }} />
                <span className="text-lg font-semibold">JIRA Issue Details</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Convert to JIRA Issue</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm font-semibold text-foreground">
                {feature.jira_integration ? 'Feature Details' : 'Feature to Convert'}
              </Label>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
              <h4 className="font-semibold text-base mb-2 text-foreground">{feature.title}</h4>
              {feature.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
              )}
            </div>
          </div>

          {feature.jira_integration && (
            <Card className="border-green-500/20 bg-green-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" style={{ color: 'hsl(var(--tint-success))' }} />
                  <span style={{ color: 'hsl(var(--tint-success))' }}>JIRA Issue Created</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">Issue:</span>
                    <Badge variant="default" className="bg-green-500 text-white px-3 py-1">
                      {feature.jira_integration.external_id} - {feature.title}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">Issue Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.jira_integration.integration_metadata?.issue_type || 'Task'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.jira_integration.external_status || 'To Do'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">Last Synced:</span>
                    <span className="text-muted-foreground text-sm">
                      {feature.jira_integration.last_synced_at
                        ? new Date(feature.jira_integration.last_synced_at).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                </div>

                {feature.jira_integration.external_url && (
                  <div className="pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(feature.jira_integration!.external_url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View in JIRA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!feature.jira_integration && (
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
                                  {type.name ===
                                    selectedIntegration?.config?.default_issue_type && (
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
          )}

          {syncToJira.data && (
            <Card
              className={
                syncToJira.data.success
                  ? 'border-green-500/20 bg-green-500/10'
                  : 'border-destructive/20 bg-destructive/10'
              }
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-3">
                  {syncToJira.data.success ? (
                    <>
                      <CheckCircle
                        className="h-5 w-5"
                        style={{ color: 'hsl(var(--tint-success))' }}
                      />
                      <span style={{ color: 'hsl(var(--tint-success))' }}>
                        JIRA Issue Created Successfully!
                      </span>
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
                {syncToJira.data.success ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-muted-foreground">Issue:</span>
                        <Badge variant="default" className="bg-green-500 text-white px-3 py-1">
                          {syncToJira.data.data.issue_key} - {feature.title}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-muted-foreground">Project:</span>
                        <span className="text-muted-foreground text-sm">
                          {projectName ||
                            (selectedIntegration
                              ? getProjectDisplayName(selectedIntegration)
                              : 'Unknown')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-muted-foreground">
                          Issue Type:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {issueType}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-xs">
                          To Do
                        </Badge>
                      </div>
                    </div>

                    {syncToJira.data.data.issue_url && (
                      <div className="pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(syncToJira.data.data.issue_url, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View in JIRA
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="font-medium text-destructive">
                          Failed to Create JIRA Issue
                        </h4>
                        <p className="text-sm text-destructive/80 mt-1">
                          {syncToJira.data.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="flex-1 h-11">
            {feature.jira_integration ? 'Close' : 'Cancel'}
          </Button>
          {!feature.jira_integration && (
            <Button
              onClick={handleConvertToJira}
              disabled={!selectedIntegrationId || !selectedProjectKey || syncToJira.isPending}
              className="flex-1 h-11"
            >
              {syncToJira.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating JIRA Issue...</span>
                </div>
              ) : (
                'Create JIRA Issue'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
