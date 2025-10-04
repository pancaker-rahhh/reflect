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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Loader2, CheckCircle, XCircle, ExternalLink, Settings, FolderOpen } from 'lucide-react'
import {
  useJiraConnectionTest,
  useJiraProjects,
  useCreateJiraIntegration,
} from '@/hooks/useJiraIntegration'

interface JiraIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

export function JiraIntegrationModal({ isOpen, onClose, projectId }: JiraIntegrationModalProps) {
  const [step, setStep] = useState<'connection' | 'discovery' | 'complete'>('connection')
  const [jiraUrl, setJiraUrl] = useState('')
  const [authType, setAuthType] = useState<'api_token' | 'basic_auth'>('api_token')
  const [email, setEmail] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [defaultProject, setDefaultProject] = useState<string>('none')
  const [autoCreate, setAutoCreate] = useState(false)

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
    const authData =
      authType === 'api_token' ? { username: email, api_token: apiToken } : { username, password }

    const config: Record<string, unknown> = {
      auto_create_issues: autoCreate,
      include_metadata: true,
    }

    if (defaultProject && defaultProject !== 'none') {
      config.project_key = defaultProject
    }

    await createIntegration.mutateAsync({
      project_id: projectId,
      name: `JIRA Integration`,
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
    setDefaultProject('none')
    setAutoCreate(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold">Connect to JIRA</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'connection' && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">Connect to JIRA</h3>
              <p className="text-gray-600">
                Connect once, use everywhere. Your action items can be converted to issues in any of
                your JIRA projects.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="jira-url" className="text-sm font-semibold text-gray-900">
                  JIRA Instance URL
                </Label>
                <Input
                  id="jira-url"
                  type="url"
                  placeholder="https://your-company.atlassian.net"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Authentication Method</Label>
                <Select
                  value={authType}
                  onValueChange={(value: 'api_token' | 'basic_auth') => setAuthType(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_token">API Token (Recommended)</SelectItem>
                    <SelectItem value="basic_auth">Username & Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {authType === 'api_token' ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your-email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-token" className="text-sm font-semibold text-gray-900">
                      API Token
                    </Label>
                    <Input
                      id="api-token"
                      type="password"
                      placeholder="Enter your JIRA API token"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="h-11"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      <ExternalLink className="inline h-3 w-3 mr-1" />
                      <a
                        href="https://id.atlassian.com/manage-profile/security/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                      >
                        Get your API token from Atlassian
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-900">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="your-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={!jiraUrl || connectionTest.isPending}
              className="w-full h-11"
            >
              {connectionTest.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Testing Connection...</span>
                </div>
              ) : (
                'Test Connection'
              )}
            </Button>

            {connectionTest.data && (
              <Card
                className={
                  connectionTest.data.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-3">
                    {connectionTest.data.success ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-900">Connection Successful</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-900">Connection Failed</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{connectionTest.data.message}</p>
                </CardContent>
              </Card>
            )}

            {connectionTest.data?.success && (
              <Button onClick={() => setStep('discovery')} className="w-full h-11">
                Continue
              </Button>
            )}
          </div>
        )}

        {step === 'discovery' && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">Found Your Projects</h3>
              <p className="text-gray-600">
                Your action items can be converted to issues in any of these projects
              </p>
            </div>

            {projectsQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">
                    Loading your projects...
                  </span>
                </div>
                <p className="text-gray-600">Discovering available JIRA projects</p>
              </div>
            ) : projectsQuery.data?.success ? (
              <div className="space-y-5">
                <div className="grid gap-3">
                  {projectsQuery.data.projects.map((project) => (
                    <div
                      key={project.key}
                      className="flex items-center gap-3 p-4 border border-border rounded-lg bg-tertiary shadow-sm hover:shadow-md transition-shadow"
                    >
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">Project key: {project.key}</div>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        Available
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Default Project (Optional)
                    </Label>
                    <Select value={defaultProject} onValueChange={setDefaultProject}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a default project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No default</SelectItem>
                        {projectsQuery.data.projects.map((project) => (
                          <SelectItem key={project.key} value={project.key}>
                            {project.name} ({project.key})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600">
                      You can always choose the project when creating issues
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('connection')}
                    className="flex-1 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateIntegration}
                    disabled={createIntegration.isPending}
                    className="flex-1 h-11"
                  >
                    {createIntegration.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Integration...</span>
                      </div>
                    ) : (
                      'Connect JIRA'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <span className="text-lg font-medium text-red-900">Failed to load projects</span>
                </div>
                <p className="text-gray-600 mb-6">Unable to discover your JIRA projects</p>
                <Button variant="outline" onClick={() => setStep('connection')} className="h-11">
                  Go Back
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">JIRA Connected Successfully!</h3>
              <p className="text-gray-600">
                Your JIRA integration is ready. You can now convert action items to JIRA issues.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full h-11">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
