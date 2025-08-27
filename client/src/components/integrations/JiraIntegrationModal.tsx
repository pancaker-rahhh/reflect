import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle, XCircle, ExternalLink, Settings } from 'lucide-react'
import {
  useJiraConnectionTest,
  useJiraProjects,
  useCreateJiraIntegration,
} from '@/hooks/useJiraIntegration'
import type { JiraProject, JiraConfig } from '@/lib/api'

interface JiraIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

export function JiraIntegrationModal({ isOpen, onClose, projectId }: JiraIntegrationModalProps) {
  const [step, setStep] = useState<'connection' | 'configuration' | 'complete'>('connection')
  const [jiraUrl, setJiraUrl] = useState('')
  const [authType, setAuthType] = useState<'api_token' | 'basic_auth'>('api_token')
  const [email, setEmail] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null)
  const [issueType, setIssueType] = useState('Task')
  const [priority, setPriority] = useState('Medium')
  const [autoCreate, setAutoCreate] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const connectionTest = useJiraConnectionTest()
  const createIntegration = useCreateJiraIntegration()

  const projectsQuery = useJiraProjects(
    jiraUrl,
    authType,
    { username: email, api_token: apiToken, password },
    connectionTest.data?.success || false
  )

  const handleTestConnection = async () => {
    const authData =
      authType === 'api_token' ? { username: email, api_token: apiToken } : { username, password }

    await connectionTest.mutateAsync({
      jira_url: jiraUrl,
      auth_type: authType,
      ...authData,
    })
  }

  const handleCreateIntegration = async () => {
    if (!selectedProject) return

    const authData =
      authType === 'api_token' ? { username: email, api_token: apiToken } : { username, password }

    const config = {
      project_key: selectedProject.key,
      default_issue_type: issueType,
      default_priority: priority,
      auto_create_issues: autoCreate,
      include_metadata: includeMetadata,
    }

    await createIntegration.mutateAsync({
      project_id: projectId,
      name: `JIRA Integration - ${selectedProject.key}`,
      jira_url: jiraUrl,
      auth_type: authType,
      auth_data: authData,
      config: config,
    })

    setStep('complete')
  }

  const resetForm = () => {
    setStep('connection')
    setJiraUrl('')
    setAuthType('api_token')
    setEmail('')
    setApiToken('')
    setUsername('')
    setPassword('')
    setSelectedProject(null)
    setIssueType('Task')
    setPriority('Medium')
    setAutoCreate(true)
    setIncludeMetadata(true)
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
            <Settings className="h-5 w-5" />
            Connect JIRA Integration
          </DialogTitle>
        </DialogHeader>

        {step === 'connection' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jira-url">JIRA Instance URL</Label>
                <Input
                  id="jira-url"
                  type="url"
                  placeholder="https://your-company.atlassian.net"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                />
              </div>

              <div>
                <Label>Authentication Method</Label>
                <Select
                  value={authType}
                  onValueChange={(value: 'api_token' | 'basic_auth') => setAuthType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_token">API Token (Recommended)</SelectItem>
                    <SelectItem value="basic_auth">Username & Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {authType === 'api_token' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your-email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-token">API Token</Label>
                    <Input
                      id="api-token"
                      type="password"
                      placeholder="Enter your JIRA API token"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      <ExternalLink className="inline h-3 w-3 mr-1" />
                      <a
                        href="https://id.atlassian.com/manage-profile/security/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        Get your API token from Atlassian
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="your-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={!jiraUrl || connectionTest.isPending}
              className="w-full"
            >
              {connectionTest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            {connectionTest.data && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {connectionTest.data.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Connection Successful
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        Connection Failed
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{connectionTest.data.message}</p>
                </CardContent>
              </Card>
            )}

            {connectionTest.data?.success && projectsQuery.data?.success && (
              <div className="space-y-4">
                <div>
                  <Label>Select JIRA Project</Label>
                  <Select
                    onValueChange={(projectKey) => {
                      const project = projectsQuery.data.projects.find((p) => p.key === projectKey)
                      setSelectedProject(project || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsQuery.data.projects.map((project) => (
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

                {selectedProject && (
                  <Button onClick={() => setStep('configuration')} className="w-full">
                    Continue to Configuration
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'configuration' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Default Issue Type</Label>
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
                <Label>Default Priority</Label>
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-create"
                    checked={autoCreate}
                    onCheckedChange={(checked) => setAutoCreate(checked as boolean)}
                  />
                  <Label htmlFor="auto-create">
                    Automatically create JIRA issues when action items are created
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                  />
                  <Label htmlFor="include-metadata">Include Reflect metadata in JIRA issues</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('connection')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCreateIntegration}
                disabled={createIntegration.isPending}
                className="flex-1"
              >
                {createIntegration.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Integration...
                  </>
                ) : (
                  'Create Integration'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Integration Created Successfully!</h3>
            <p className="text-muted-foreground">
              Your JIRA integration is now configured and ready to use.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
