import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, organizationApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagManager } from '@/components/roadmap/TagManager'
import type { Roadmap, RoadmapColumn } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import type { RoadmapColumnCreateRequest } from '@/lib/api/roadmap'

export function RoadmapSettings() {
  const [formData, setFormData] = useState<Partial<Roadmap>>({})
  const [columns, setColumns] = useState<RoadmapColumn[]>([])
  const [isEdited, setIsEdited] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
    const newColumn: RoadmapColumn = {
      id: `temp-${Date.now()}`,
      roadmap_id: roadmap?.id || 'temp',
      name: 'New Column',
      status: 'new',
      color: '#6b7280',
      order: columns.length,
      features: [],
    }
    setColumns((prev) => [...prev, newColumn])
    setIsEdited(true)
  }

  const removeColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId))
    setIsEdited(true)
  }

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

        const columnCreationPromises = columns.map((column) => {
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

        const columnsToDelete = existingColumns.filter((ec) => !columns.some((c) => c.id === ec.id))
        columnPromises.push(...columnsToDelete.map((c) => deleteColumnMutation.mutateAsync(c.id)))

        for (const column of columns) {
          if (column.id.startsWith('temp-')) {
            const { id, features, roadmap_id, ...newColumnData } = column
            columnPromises.push(
              createColumnMutation.mutateAsync({
                ...newColumnData,
                roadmap_id: roadmap.id,
              })
            )
          } else {
            const originalColumn = existingColumns.find((c) => c.id === column.id)
            if (originalColumn && JSON.stringify(originalColumn) !== JSON.stringify(column)) {
              const { id, features, roadmap_id, ...updateData } = column
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const publicRoadmapUrl = formData.subdomain
    ? `https://${formData.subdomain}.reflect.com/roadmap`
    : formData.public_slug
      ? `https://reflect.com/public/roadmaps/${formData.public_slug}`
      : ''

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Roadmap Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your public roadmap visibility and appearance
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
        <h1 className="text-3xl font-bold">Roadmap Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your public roadmap visibility and appearance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Roadmap Visibility
          </CardTitle>
          <CardDescription>Control who can view your product roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isPublic">Public Roadmap</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone to view your roadmap without authentication
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.is_public || false}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
          </div>

          {formData.is_public && publicRoadmapUrl && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Public URL</p>
                  <p className="text-sm text-muted-foreground truncate">{publicRoadmapUrl}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(publicRoadmapUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={publicRoadmapUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure your roadmap's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Roadmap Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Product Roadmap"
              className="w-full sm:max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                value={formData.subdomain || ''}
                onChange={(e) => handleInputChange('subdomain', e.target.value)}
                placeholder="your-product"
                className="w-full sm:max-w-md"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .reflect.com/roadmap
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Custom subdomain for your public roadmap
            </p>
          </div>

          <div className="space-y-2">
            <Label>Roadmap Logo</Label>
            <div className="space-y-4">
              {formData.logo_url && (
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                  <div className="relative group">
                    <img
                      src={formData.logo_url}
                      alt="Current logo"
                      className="w-16 h-16 object-contain bg-background rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={clearLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formData.logo_url.startsWith('data:') ? 'Uploaded image' : formData.logo_url}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url?.startsWith('data:') ? '' : formData.logo_url || ''}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  className="flex-1"
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

              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center pointer-events-none">
                  {isDragging ? (
                    <>
                      <Image className="mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-medium text-primary">Drop your image here</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {roadmap && <TagManager roadmapId={roadmap.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Roadmap Columns</CardTitle>
          <CardDescription>Configure the columns and statuses for your roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {columns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No columns defined yet</p>
              <p className="text-xs mt-1">Add columns to organize your roadmap features</p>
            </div>
          ) : (
            <div className="space-y-4">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Column Name</Label>
                      <Input
                        value={column.name}
                        onChange={(e) => handleColumnChange(column.id, 'name', e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Mapped Status</Label>
                      <Select
                        value={column.status}
                        onValueChange={(value) => handleColumnChange(column.id, 'status', value)}
                      >
                        <SelectTrigger className="text-sm">
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

                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={column.color}
                          onChange={(e) => handleColumnChange(column.id, 'color', e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={column.color}
                          onChange={(e) => handleColumnChange(column.id, 'color', e.target.value)}
                          className="text-sm flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColumn(column.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" onClick={addColumn} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>
        </CardContent>
      </Card>

      {isEdited && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-muted/50 rounded-lg border sticky bottom-0">
          <div className="flex-1">
            <p className="text-sm font-medium">You have unsaved changes</p>
            <p className="text-sm text-muted-foreground">
              Save your changes to update the roadmap settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={
                createRoadmapMutation.isPending ||
                updateRoadmapMutation.isPending ||
                createColumnMutation.isPending ||
                updateColumnMutation.isPending ||
                deleteColumnMutation.isPending
              }
              className="min-w-[120px]"
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
            <Button
              variant="outline"
              onClick={() => {
                if (roadmap) {
                  setFormData(roadmap)
                  setColumns(roadmap.columns || [])
                }
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
