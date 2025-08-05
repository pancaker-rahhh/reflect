import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Save, Trash2, AlertTriangle, ExternalLink, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

export function ProjectSettings() {
  const [formData, setFormData] = useState<Partial<Project>>({})
  const [isEdited, setIsEdited] = useState(false)
  
  const queryClient = useQueryClient()
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    onSuccess: (data) => {
      if (data.length > 0) {
        setFormData(data[0])
      }
    }
  })

  const project = projects?.[0]

  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => 
      project ? api.updateProject(project.id, data) : Promise.reject('No project'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsEdited(false)
    },
    onError: () => {
      console.error('Failed to update project')
    }
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => 
      project ? api.deleteProject(project.id) : Promise.reject('No project'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      console.error('Failed to delete project')
    }
  })

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsEdited(true)
  }

  const handleSave = () => {
    if (project && formData) {
      updateProjectMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone and will remove all associated data.')) {
      deleteProjectMutation.mutate()
    }
  }

  const publicReviewsUrl = formData.publicReviewsSlug 
    ? `https://${formData.publicReviewsSlug}.feedbask.com`
    : ''

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your project settings and preferences
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your project settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Basic project information and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Project Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Enter project display name"
              className="w-full sm:max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              This name will be displayed publicly on your review pages
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl || ''}
              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full sm:max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              URL to your project logo for branding
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainWebsiteUrl">Main Website URL</Label>
            <Input
              id="mainWebsiteUrl"
              value={formData.mainWebsiteUrl || ''}
              onChange={(e) => handleInputChange('mainWebsiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full sm:max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Your main website URL for linking back from public pages
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project..."
              className="w-full sm:max-w-lg"
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {(formData.description?.length || 0)}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Reviews Page Configuration
          </CardTitle>
          <CardDescription>
            Configure your public reviews showcase page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="publicReviewsEnabled">Enable Public Reviews Page</Label>
              <p className="text-sm text-muted-foreground">
                Allow visitors to view and submit reviews publicly
              </p>
            </div>
            <Switch
              id="publicReviewsEnabled"
              checked={formData.publicReviewsEnabled || false}
              onCheckedChange={(checked) => handleInputChange('publicReviewsEnabled', checked)}
            />
          </div>

          {formData.publicReviewsEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="publicReviewsSlug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="publicReviewsSlug"
                    value={formData.publicReviewsSlug || ''}
                    onChange={(e) => handleInputChange('publicReviewsSlug', e.target.value)}
                    placeholder="your-project-name"
                    className="w-full sm:max-w-md"
                  />
                  {publicReviewsUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={publicReviewsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {publicReviewsUrl && (
                  <p className="text-sm text-muted-foreground">
                    Public URL: {publicReviewsUrl}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allowNewReviews">Allow New Review Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Show "Write a review" button on public page
                  </p>
                </div>
                <Switch
                  id="allowNewReviews"
                  checked={formData.allowNewReviews || false}
                  onCheckedChange={(checked) => handleInputChange('allowNewReviews', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewSortOrder">Default Review Sort Order</Label>
                <Select
                  value={formData.reviewSortOrder || 'newest'}
                  onValueChange={(value) => handleInputChange('reviewSortOrder', value)}
                >
                  <SelectTrigger className="w-full sm:max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Rating</SelectItem>
                    <SelectItem value="lowest">Lowest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Optimize your public pages for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="seoTitleSuffix">Page Title Suffix</Label>
            <Input
              id="seoTitleSuffix"
              value={formData.seoTitleSuffix || ''}
              onChange={(e) => handleInputChange('seoTitleSuffix', e.target.value)}
              placeholder="- Your Brand"
              className="w-full sm:max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Text appended to public page titles
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoMetaDescription">Meta Description</Label>
            <Textarea
              id="seoMetaDescription"
              value={formData.seoMetaDescription || ''}
              onChange={(e) => handleInputChange('seoMetaDescription', e.target.value)}
              placeholder="Description for search engines..."
              className="w-full sm:max-w-lg"
              maxLength={160}
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seoMetaDescription?.length || 0)}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting your project will permanently remove all associated data including widgets, feedback, reviews, and settings. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProjectMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEdited && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex-1">
            <p className="text-sm font-medium">You have unsaved changes</p>
            <p className="text-sm text-muted-foreground">Save your changes to update the project settings</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={updateProjectMutation.isPending}
              className="min-w-[120px]"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setFormData(project || {})
                setIsEdited(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}