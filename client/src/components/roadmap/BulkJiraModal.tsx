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
import { useBulkCreateJiraIssues } from '@/hooks/useJiraIntegration'
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
  const [issueType, setIssueType] = useState('Task')
  const [priority, setPriority] = useState('Medium')

  const bulkCreate = useBulkCreateJiraIssues()

  const handleBulkCreate = async () => {
    if (!selectedIntegrationId) return

    const selectedIntegration = jiraIntegrations.find(
      (integration) => integration.id === selectedIntegrationId
    )
    if (!selectedIntegration) return

    const request = {
      action_item_ids: selectedItems.map((item) => item.id),
      jira_integration_id: selectedIntegrationId,
      jira_config: {
        project_key: selectedIntegration.config?.project_key || '',
        issue_type: issueType,
        priority: priority,
      },
    }

    await bulkCreate.mutateAsync(request)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Push {selectedItems.length} Action Items to JIRA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-900">Selected Items</Label>
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
                  <Badge variant="outline" className="text-xs">
                    {item.tags?.length || 0} tags
                  </Badge>
                </div>
              ))}
            </div>
          </div>

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
            )}

            {selectedIntegrationId && (
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
            )}
          </div>

          {bulkCreate.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {bulkCreate.data.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bulk Creation Results
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      Some Issues Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Requested:</span>
                  <Badge variant="outline">{bulkCreate.data.data.total_requested}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Successful:</span>
                  <Badge variant="default" className="bg-green-500">
                    {bulkCreate.data.data.successful_count}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Failed:</span>
                  <Badge variant="destructive">{bulkCreate.data.data.failed_count}</Badge>
                </div>

                {bulkCreate.data.data.results.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Results:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {bulkCreate.data.data.results.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded text-xs"
                        >
                          <span className="truncate flex-1">
                            {selectedItems.find((item) => item.id === result.action_item_id)?.title}
                          </span>
                          {result.status === 'success' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">{result.issue_key}</span>
                              {result.issue_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => window.open(result.issue_url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="text-red-600 text-xs">{result.error}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkCreate.data.data.successful_count > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const successfulResults = bulkCreate.data.data.results.filter(
                          (r) => r.status === 'success' && r.issue_url
                        )
                        if (successfulResults.length > 0) {
                          window.open(successfulResults[0].issue_url, '_blank')
                        }
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Created Issues in JIRA
                    </Button>
                  </div>
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
            ) : bulkCreate.data ? (
              'Create More Issues'
            ) : (
              `Create ${selectedItems.length} JIRA Issue${selectedItems.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
