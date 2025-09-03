import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, organizationApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Upload,
  Image,
  X,
  Loader2,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagManager } from '@/components/roadmap/TagManager'
import type { Roadmap, RoadmapColumn } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import type { RoadmapColumnCreateRequest } from '@/lib/api/roadmap'

// Extended type for local column management
interface ExtendedRoadmapColumn extends RoadmapColumn {
  _markedForDeletion?: boolean
}

export function RoadmapSettings() {
  const [formData, setFormData] = useState<Partial<Roadmap>>({})
  const [columns, setColumns] = useState<ExtendedRoadmapColumn[]>([])
  const [isEdited, setIsEdited] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<'overview' | 'columns' | 'tags'>('overview')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationApi.getMy(),
  })

  const organizationId = organizations?.[0]?.id

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => (organizationId ? api.getProjectsByOrganization(organizationId) : null),
    enabled: !!organizationId,
  })

  const project = projectsData?.items?.[0]

  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery({
    queryKey: ['roadmap', project?.id],
    queryFn: () => (project ? api.getRoadmap(project.id) : null),
    enabled: !!project,
  })

  useEffect(() => {
    if (roadmap) {
      setFormData(roadmap)
      setColumns(roadmap.columns || [])
    } else if (project) {
      setColumns([])
    }
  }, [roadmap, project])

  const createRoadmapMutation = useMutation({
    mutationFn: (data: {
      name: string
      project_id: string
      is_public: boolean
      subdomain?: string
      logo_url?: string
    }) => api.createRoadmap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', project?.id] })
      setIsEdited(false)
      toast({
        title: 'Roadmap created',
        description: 'Your new roadmap is ready.',
      })
    },
  })

  const updateRoadmapMutation = useMutation({
    mutationFn: (data: Partial<Roadmap>) =>
      roadmap ? api.updateRoadmap(roadmap.id, data) : Promise.reject('No roadmap'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', project?.id] })
      setIsEdited(false)
      toast({
        title: 'Roadmap updated',
        description: 'Your changes have been saved successfully.',
      })
    },
  })

  const createColumnMutation = useMutation({
    mutationFn: (data: RoadmapColumnCreateRequest) => api.createRoadmapColumn(data),
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoadmapColumn> }) =>
      api.updateRoadmapColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => api.deleteRoadmapColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    },
  })

  const handleInputChange = (field: keyof Roadmap, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsEdited(true)
  }

  const handleColumnChange = (columnId: string, field: keyof RoadmapColumn, value: any) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, [field]: value } : col))
    )
    setIsEdited(true)
  }

  const addColumn = () => {
    const newColumn: ExtendedRoadmapColumn = {
      id: `temp-${Date.now()}`,
      roadmap_id: roadmap?.id || 'temp',
      name: 'New Column',
      status: 'new',
      color: '#6b7280',
      order: columns.length,
      action_items: [],
    }
    setColumns((prev) => [...prev, newColumn])
    setIsEdited(true)
  }

  const removeColumn = (columnId: string) => {
    // Mark column for deletion instead of just removing from local state
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, _markedForDeletion: true } : col))
    )
    setIsEdited(true)
  }

  const restoreAllDeletedColumns = () => {
    setColumns((prev) =>
      prev.map((col) => (col._markedForDeletion ? { ...col, _markedForDeletion: false } : col))
    )
    setIsEdited(true)
  }

  const getDeletedColumnsCount = () => columns.filter((col) => col._markedForDeletion).length

  const handleSave = async () => {
    if (!project) return

    try {
      if (!roadmap) {
        const newRoadmap = await createRoadmapMutation.mutateAsync({
          name: formData.name || 'Product Roadmap',
          project_id: project.id,
          is_public: formData.is_public || false,
          ...(formData.subdomain && { subdomain: formData.subdomain }),
          ...(formData.logo_url && { logo_url: formData.logo_url }),
        })

        const columnCreationPromises = columns
          .filter((col) => !col._markedForDeletion)
          .map((column) => {
            return createColumnMutation.mutateAsync({
              name: column.name,
              status: column.status,
              color: column.color,
              order: column.order,
              roadmap_id: newRoadmap.id,
            })
          })
        await Promise.all(columnCreationPromises)
      } else {
        await updateRoadmapMutation.mutateAsync({
          name: formData.name,
          is_public: formData.is_public,
          subdomain: formData.subdomain,
          logo_url: formData.logo_url,
        })

        const existingColumns = roadmap.columns || []
        const columnPromises = []

        // Delete columns that were marked for deletion
        const columnsToDelete = existingColumns.filter((ec: any) =>
          columns.some((c) => c.id === ec.id && c._markedForDeletion)
        )
        columnPromises.push(...columnsToDelete.map((c: any) => deleteColumnMutation.mutateAsync(c.id)))

        // Handle remaining columns (create new, update existing)
        for (const column of columns.filter((col) => !col._markedForDeletion)) {
          if (column.id.startsWith('temp-')) {
            const { id, action_items, roadmap_id, _markedForDeletion, ...newColumnData } = column
            columnPromises.push(
              createColumnMutation.mutateAsync({
                ...newColumnData,
                roadmap_id: roadmap.id,
              })
            )
          } else {
            const originalColumn = existingColumns.find((c: any) => c.id === column.id)
            if (originalColumn && JSON.stringify(originalColumn) !== JSON.stringify(column)) {
              const { id, action_items, roadmap_id, _markedForDeletion, ...updateData } = column
              columnPromises.push(
                updateColumnMutation.mutateAsync({
                  id: column.id,
                  data: updateData,
                })
              )
            }
          }
        }
        await Promise.all(columnPromises)
      }

      queryClient.invalidateQueries({ queryKey: ['roadmap', project.id] })
      setIsEdited(false)
    } catch (error) {
      console.error('Failed to save roadmap settings:', error)
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your roadmap. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'URL copied',
        description: 'Public roadmap URL has been copied to clipboard',
      })
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast({
        title: 'Copy failed',
        description: 'Failed to copy URL to clipboard',
        variant: 'destructive',
      })
    }
  }

  const getPublicRoadmapUrl = () => {
    if (!formData.is_public) return null

    if (formData.subdomain) {
      return `http://localhost:5173/public/r/${formData.subdomain}`
    } else if (formData.public_slug) {
      return `http://localhost:5173/public/roadmap/${formData.public_slug}`
    }
    return null
  }

  const publicRoadmapUrl = getPublicRoadmapUrl()

  const handleFileSelect = async (file: File) => {
    setUploadError(null)

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB')
      return
    }

    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        handleInputChange('logo_url', dataUrl)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setUploadError('Failed to read file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setUploadError('Failed to upload image')
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearLogo = () => {
    handleInputChange('logo_url', '')
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isLoading = isLoadingOrgs || isLoadingProjects || isLoadingRoadmap

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Loading Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted/30 rounded-full mx-auto animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted/30 rounded-lg w-64 mx-auto animate-pulse"></div>
              <div className="h-4 bg-muted/30 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Loading Cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted/30 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted/30 rounded w-full"></div>
                <div className="h-4 bg-muted/30 rounded w-3/4"></div>
                <div className="h-4 bg-muted/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate setup completion
  const setupSteps = [
    { key: 'name', label: 'Roadmap Name', completed: !!formData.name },
    { key: 'columns', label: 'Columns Setup', completed: columns.length > 0 },
    { key: 'tags', label: 'Tags Configuration', completed: true }, // Always true since tags are optional
  ]
  const completedSteps = setupSteps.filter((step) => step.completed).length
  const setupProgress = (completedSteps / setupSteps.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Enhanced Header with Progress */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Roadmap Settings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Configure your product roadmap, organize columns, and manage tags to create an intuitive
            workflow for your team.
          </p>
        </div>

        {/* Setup Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Setup Progress</span>
            <span>
              {completedSteps}/{setupSteps.length} completed
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${setupProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {setupSteps.map((step) => (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mb-1 transition-all duration-300',
                    step.completed ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
                <span
                  className={cn(
                    'text-center transition-colors duration-300',
                    step.completed ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-muted/30 rounded-lg p-1 border border-border/50">
          {[
            { key: 'overview', label: 'Overview', icon: MapPin },
            { key: 'columns', label: 'Columns', icon: Plus },
            { key: 'tags', label: 'Tags', icon: Tag },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200',
                activeSection === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Roadmap Configuration Card */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Roadmap Configuration</CardTitle>
                    <CardDescription>Basic settings and branding for your roadmap</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Roadmap Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Product Roadmap"
                      className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subdomain" className="text-sm font-medium">
                      Custom Subdomain
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        value={formData.subdomain || ''}
                        onChange={(e) => handleInputChange('subdomain', e.target.value)}
                        placeholder="your-product"
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap font-mono">
                        .reflect.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Public Access</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={formData.is_public || false}
                      onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                    />
                    <Label htmlFor="public" className="text-sm text-muted-foreground">
                      Make roadmap publicly accessible
                    </Label>
                  </div>

                  {formData.is_public && publicRoadmapUrl && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-medium text-foreground">
                            Public Roadmap URL
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-3 bg-background rounded-md border font-mono text-sm text-foreground">
                            {publicRoadmapUrl}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(publicRoadmapUrl)}
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Share this URL with your users or embed it on your website to show your
                          roadmap publicly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Logo & Branding Card */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <Image className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Logo & Branding</CardTitle>
                    <CardDescription>
                      Upload your logo and customize the visual identity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {formData.logo_url && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                      <div className="relative group">
                        <img
                          src={formData.logo_url}
                          alt="Current logo"
                          className="w-16 h-16 object-contain bg-background rounded-lg border shadow-sm"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={clearLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Current Logo</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formData.logo_url.startsWith('data:')
                            ? 'Uploaded image'
                            : formData.logo_url}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={formData.logo_url?.startsWith('data:') ? '' : formData.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      className="flex-1 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      disabled={formData.logo_url?.startsWith('data:')}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{uploadError}</p>
                    </div>
                  )}

                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer hover:border-primary/50 hover:bg-primary/5',
                      isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center pointer-events-none">
                      {isDragging ? (
                        <>
                          <Image className="mx-auto h-10 w-10 text-primary mb-3" />
                          <p className="text-lg font-medium text-primary">Drop your image here</p>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-base font-medium text-muted-foreground">
                            Drag and drop your logo here, or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            PNG, JPG, GIF up to 2MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Columns Section */}
        {activeSection === 'columns' && (
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Roadmap Columns</CardTitle>
                      <CardDescription>
                        Configure the workflow stages and statuses for your roadmap
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDeletedColumnsCount() > 0 && (
                      <Button
                        variant="outline"
                        onClick={restoreAllDeletedColumns}
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                      >
                        Restore {getDeletedColumnsCount()} Deleted
                      </Button>
                    )}
                    <Button
                      onClick={addColumn}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Column
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {columns.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-10 w-10 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No columns defined yet</h3>
                    <p className="text-sm mb-4">
                      Add columns to organize your roadmap features and create a clear workflow
                    </p>
                    <Button onClick={addColumn} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Column
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {columns.map((column, index) => (
                      <div
                        key={column.id}
                        className={cn(
                          'group relative p-6 border rounded-xl transition-all duration-200 hover:shadow-md',
                          column._markedForDeletion
                            ? 'border-destructive/50 bg-destructive/5 opacity-60'
                            : 'border-border/50 bg-muted/20 hover:bg-muted/30'
                        )}
                      >
                        {column._markedForDeletion && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="text-xs">
                              Marked for deletion
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold',
                                column._markedForDeletion
                                  ? 'bg-destructive/20 text-destructive'
                                  : 'bg-muted/50 text-muted-foreground'
                              )}
                            >
                              #{index + 1}
                            </div>
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full shadow-sm transition-all duration-200',
                                column._markedForDeletion && 'opacity-50'
                              )}
                              style={{ backgroundColor: column.color }}
                            />
                          </div>

                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Column Name
                              </Label>
                              <Input
                                value={column.name}
                                onChange={(e) =>
                                  handleColumnChange(column.id, 'name', e.target.value)
                                }
                                className={cn(
                                  'text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200',
                                  column._markedForDeletion &&
                                    'bg-destructive/10 border-destructive/30'
                                )}
                                placeholder="Enter column name"
                                disabled={column._markedForDeletion}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Status
                              </Label>
                              <Select
                                value={column.status}
                                onValueChange={(value) =>
                                  handleColumnChange(column.id, 'status', value)
                                }
                                disabled={column._markedForDeletion}
                              >
                                <SelectTrigger
                                  className={cn(
                                    'text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200',
                                    column._markedForDeletion &&
                                      'bg-destructive/10 border-destructive/30'
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="planned">Planned</SelectItem>
                                  <SelectItem value="under-review">Under Review</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="declined">Declined</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Color
                              </Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={column.color}
                                  onChange={(e) =>
                                    handleColumnChange(column.id, 'color', e.target.value)
                                  }
                                  className={cn(
                                    'w-8 h-8 rounded-lg border cursor-pointer hover:scale-110 transition-transform duration-200',
                                    column._markedForDeletion && 'opacity-50 cursor-not-allowed'
                                  )}
                                  disabled={column._markedForDeletion}
                                />
                                <Input
                                  value={column.color}
                                  onChange={(e) =>
                                    handleColumnChange(column.id, 'color', e.target.value)
                                  }
                                  className={cn(
                                    'text-sm flex-1 focus:ring-2 focus:ring-primary/20 transition-all duration-200',
                                    column._markedForDeletion &&
                                      'bg-destructive/10 border-destructive/30'
                                  )}
                                  placeholder="#000000"
                                  disabled={column._markedForDeletion}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Features
                              </Label>
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center',
                                    column._markedForDeletion ? 'bg-destructive/20' : 'bg-muted/50'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      column._markedForDeletion
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                                                         {column.action_items?.length || 0}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">features</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {column._markedForDeletion ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Restore the column
                                  setColumns((prev) =>
                                    prev.map((col) =>
                                      col.id === column.id
                                        ? { ...col, _markedForDeletion: false }
                                        : col
                                    )
                                  )
                                  setIsEdited(true)
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeColumn(column.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tags Section */}
        {activeSection === 'tags' && (
          <div className="space-y-6">{roadmap && <TagManager roadmapId={roadmap.id} />}</div>
        )}
      </div>

      {/* Enhanced Save Bar */}
      {isEdited && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-lg">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
                    <p className="text-sm text-muted-foreground">
                      Save your changes to update the roadmap settings
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (roadmap) {
                      setFormData(roadmap)
                      setColumns(roadmap.columns || [])
                    }
                    setIsEdited(false)
                  }}
                  className="px-6 transition-all duration-200 hover:scale-105"
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    createRoadmapMutation.isPending ||
                    updateRoadmapMutation.isPending ||
                    createColumnMutation.isPending ||
                    updateColumnMutation.isPending ||
                    deleteColumnMutation.isPending
                  }
                  className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {createRoadmapMutation.isPending ||
                  updateRoadmapMutation.isPending ||
                  createColumnMutation.isPending ||
                  updateColumnMutation.isPending ||
                  deleteColumnMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
