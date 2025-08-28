import { useState } from 'react'
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
import { Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react'
import { useSyncFeatureToJira, useIntegrationProjects } from '@/hooks/useJiraIntegration'
import type { RoadmapActionItem } from '@/types'

interface IndividualJiraModalProps {
  isOpen: boolean
  onClose: () => void
  feature: RoadmapActionItem
  jiraIntegrations: any[]
}

export function IndividualJiraModal({
  isOpen,
  onClose,
  feature,
  jiraIntegrations,
}: IndividualJiraModalProps) {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('')
  const [issueType, setIssueType] = useState('Task')
  const [priority, setPriority] = useState('Medium')

  const syncToJira = useSyncFeatureToJira()
  // Disabled projects fetching since we use existing integration config
  // const { data: jiraProjects, isLoading: isLoadingProjects, error: projectsError } = useIntegrationProjects(selectedIntegrationId, false)

  // Debug logging
  console.log('🔍 Debug - IndividualJiraModal selectedIntegrationId:', selectedIntegrationId)

  const handleConvertToJira = async () => {
    if (!selectedIntegrationId) return

    // Get the selected integration to use its config
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
        priority: priority,
      },
    })
  }

  const resetForm = () => {
    setSelectedIntegrationId('')
    setIssueType('Task')
    setPriority('Medium')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {feature.jira_integration ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                JIRA Issue Details
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5" />
                Convert to JIRA Issue
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Preview */}
          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-900">
                {feature.jira_integration ? 'Feature Details' : 'Feature to Convert'}
              </Label>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-sm mb-2">{feature.title}</h4>
              {feature.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {feature.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {feature.tags?.length || 0} tags
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {feature.vote_count || 0} votes
                </Badge>
              </div>
            </div>
          </div>

          {/* Show JIRA Issue Details if already synced */}
          {feature.jira_integration && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  JIRA Issue Created
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Issue:</span>
                    <Badge variant="default" className="bg-green-500">
                      {feature.jira_integration.external_id} - {feature.title}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Issue Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.jira_integration.integration_metadata?.issue_type || 'Task'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Priority:</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.jira_integration.integration_metadata?.priority || 'Medium'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.jira_integration.external_status || 'To Do'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Last Synced:</span>
                    <span className="text-muted-foreground">
                      {feature.jira_integration.last_synced_at
                        ? new Date(feature.jira_integration.last_synced_at).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                </div>

                {feature.jira_integration.external_url && (
                  <div className="pt-2 border-t">
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

          {/* Only show form fields if not already synced */}
          {!feature.jira_integration && (
            <div className="space-y-4">
              <div>
                <Label>JIRA Project</Label>
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your JIRA project" />
                  </SelectTrigger>
                  <SelectContent>
                    {jiraIntegrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.config?.project_key ||
                          integration.name?.replace('JIRA Integration - ', '') ||
                          'JIRA Project'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIntegrationId && (
                <div>
                  <Label>Issue Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedIntegrationId && (
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Highest">Highest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {syncToJira.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {syncToJira.data.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      JIRA Issue Created Successfully!
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
                {syncToJira.data.success ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Issue:</span>
                        <Badge variant="default" className="bg-green-500">
                          {syncToJira.data.data.issue_key} - {feature.title}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Project:</span>
                        <span className="text-muted-foreground">
                          {jiraIntegrations.find((i) => i.id === selectedIntegrationId)?.config
                            ?.project_key || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Issue Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {issueType}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Priority:</span>
                        <Badge variant="outline" className="text-xs">
                          {priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Status:</span>
                        <Badge variant="outline" className="text-xs">
                          To Do
                        </Badge>
                      </div>
                    </div>

                    {syncToJira.data.data.issue_url && (
                      <div className="pt-2 border-t">
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
                  <div className="text-sm text-red-600">{syncToJira.data.message}</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            {feature.jira_integration ? 'Close' : 'Cancel'}
          </Button>
          {!feature.jira_integration && (
            <Button
              onClick={handleConvertToJira}
              disabled={!selectedIntegrationId || syncToJira.isPending}
              className="flex-1"
            >
              {syncToJira.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating JIRA Issue...
                </>
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
