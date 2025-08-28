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
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [issueType, setIssueType] = useState('Task')
  const [priority, setPriority] = useState('Medium')

  const syncToJira = useSyncFeatureToJira()
  const { data: jiraProjects } = useIntegrationProjects(selectedIntegrationId, false)

  const handleConvertToJira = async () => {
    if (!selectedIntegrationId || !selectedProject) return

    await syncToJira.mutateAsync({
      featureId: feature.id,
      jiraIntegrationId: selectedIntegrationId,
      forceSync: false,
    })
  }

  const resetForm = () => {
    setSelectedIntegrationId('')
    setSelectedProject('')
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
            <ExternalLink className="h-5 w-5" />
            Convert to JIRA Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Preview */}
          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-900">Feature to Convert</Label>
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

          <div className="space-y-4">
            <div>
              <Label>JIRA Integration</Label>
              <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select JIRA integration" />
                </SelectTrigger>
                <SelectContent>
                  {jiraIntegrations.map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.config?.jira_url || 'JIRA Integration'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIntegrationId && jiraProjects?.success && (
              <div>
                <Label>JIRA Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {jiraProjects.data.projects.map((project: any) => (
                      <SelectItem key={project.key} value={project.key}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{project.key}</span>
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProject && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issue Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Highest">Highest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {syncToJira.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {syncToJira.data.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      JIRA Issue Created
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
                  <div className="flex items-center justify-between text-sm">
                    <span>Issue Key:</span>
                    <Badge variant="default" className="bg-green-500">
                      {syncToJira.data.data.issue_key}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">{syncToJira.data.message}</div>
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
            onClick={handleConvertToJira}
            disabled={!selectedIntegrationId || !selectedProject || syncToJira.isPending}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
