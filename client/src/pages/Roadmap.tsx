import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, organizationApi, userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Settings,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoadmapCard } from '@/components/roadmap/RoadmapCard'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { RoadmapColumn } from '@/types'

interface DragItem {
  featureId: string
  sourceColumnId: string
}

interface FeatureFormData {
  title: string
  description: string
  tagIds: string[]
}

export function RoadmapPage() {
  const [addFeatureModalOpen, setAddFeatureModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<{
    id: string
    name: string
    status: string
  } | null>(null)
  const [newFeature, setNewFeature] = useState<FeatureFormData>({
    title: '',
    description: '',
    tagIds: [],
  })
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const user = await userApi.getCurrentUser()
        return user
      } catch (error) {
        console.warn('Failed to get user from API, trying Supabase:', error)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const fallbackUser = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url,
            role: 'user' as const,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(),
          }
          return fallbackUser
        }
        console.warn('No user found in Supabase either')
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

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

  const { data: tags = [] } = useQuery({
    queryKey: ['roadmapTags', roadmap?.id],
    queryFn: () => (roadmap ? api.getRoadmapTags(roadmap.id) : []),
    enabled: !!roadmap?.id,
  })

  const createFeatureMutation = useMutation({
    mutationFn: (data: {
      title: string
      description: string
      column_id: string
      tag_ids?: string[]
      submitter_name?: string
      submitter_email?: string
    }) => api.createRoadmapFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      setAddFeatureModalOpen(false)
      setNewFeature({
        title: '',
        description: '',
        tagIds: [],
      })
      toast({
        title: 'Feature created',
        description: 'Your new feature has been added to the roadmap.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error creating feature',
        description: error.message || 'There was a problem saving your feature.',
        variant: 'destructive',
      })
    },
  })

  const updateFeatureOrderMutation = useMutation({
    mutationFn: (updates: { id: string; order: number; column_id?: string }[]) =>
      api.updateFeaturesOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      toast({
        title: 'Feature moved',
        description: 'Feature has been moved to the new column.',
      })
    },
    onError: (error) => {
      console.error('Error updating feature order:', error)
      toast({
        title: 'Error moving feature',
        description: error.message || 'There was a problem moving the feature.',
        variant: 'destructive',
      })
    },
  })

  const handleDragStart = (e: React.DragEvent, featureId: string, sourceColumnId: string) => {
    setDraggedItem({ featureId, sourceColumnId })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', featureId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement

    if (!currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverColumn(null)

    if (draggedItem && draggedItem.sourceColumnId !== targetColumnId && roadmap) {
      const sourceColumn = roadmap.columns.find((col) => col.id === draggedItem.sourceColumnId)
      const targetColumn = roadmap.columns.find((col) => col.id === targetColumnId)

      if (!sourceColumn || !targetColumn) {
        console.error('Source or target column not found:', { sourceColumn, targetColumn })
        return
      }

      const targetFeatures = getFeaturesByColumn(targetColumnId)
      const newOrder =
        targetFeatures.length > 0 ? Math.max(...targetFeatures.map((f) => f.order)) + 1 : 0

      updateFeatureOrderMutation.mutate([
        {
          id: draggedItem.featureId,
          order: newOrder,
          column_id: targetColumnId,
        },
      ])
    } else {
      console.log('Drop conditions not met:', {
        hasDraggedItem: !!draggedItem,
        sourceColumnId: draggedItem?.sourceColumnId,
        targetColumnId,
        isSameColumn: draggedItem?.sourceColumnId === targetColumnId,
        hasRoadmap: !!roadmap,
      })
    }

    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const toggleTag = (tagId: string) => {
    setNewFeature((prev) => {
      const hasTag = prev.tagIds.includes(tagId)
      return {
        ...prev,
        tagIds: hasTag ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
      }
    })
  }

  const handleAddFeature = () => {
    if (newFeature.title.trim() && selectedColumn) {
      let submitterName = 'Anonymous User'
      let submitterEmail = 'user@example.com'

      if (currentUser) {
        submitterName = currentUser.name || currentUser.email?.split('@')[0] || 'Anonymous User'
        submitterEmail = currentUser.email || 'user@example.com'
      } else {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            submitterName =
              user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous User'
            submitterEmail = user.email || 'user@example.com'
          }
        })
      }

      createFeatureMutation.mutate({
        title: newFeature.title,
        description: newFeature.description,
        column_id: selectedColumn.id,
        tag_ids: newFeature.tagIds.length > 0 ? newFeature.tagIds : undefined,
        submitter_name: submitterName,
        submitter_email: submitterEmail,
      })
    }
  }

  const scrollToColumn = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Column width + gap
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll =
        direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      })
    }
  }

  const getFeaturesByColumn = (columnId: string) => {
    if (!roadmap) return []

    const column = roadmap.columns.find((c) => c.id === columnId)
    if (!column) return []

    const features = column.features || []
    return [...features].sort((a, b) => a.order - b.order)
  }

  const getColumnStatus = (column: RoadmapColumn) => {
    if (
      column.status &&
      ['new', 'in-progress', 'planned', 'under-review', 'completed', 'declined'].includes(
        column.status
      )
    ) {
      return column.status
    }

    const name = column.name.toLowerCase()

    if (
      name.includes('new') ||
      name.includes('backlog') ||
      name.includes('todo') ||
      name.includes('1')
    ) {
      return 'new'
    }
    if (
      name.includes('progress') ||
      name.includes('doing') ||
      name.includes('active') ||
      name.includes('work')
    ) {
      return 'in-progress'
    }
    if (name.includes('planned') || name.includes('scheduled') || name.includes('2')) {
      return 'planned'
    }
    if (
      name.includes('review') ||
      name.includes('testing') ||
      name.includes('qa') ||
      name.includes('check')
    ) {
      return 'under-review'
    }
    if (name.includes('complete') || name.includes('done') || name.includes('finished')) {
      return 'completed'
    }
    if (name.includes('decline') || name.includes('rejected') || name.includes('cancelled')) {
      return 'declined'
    }

    if (column.order === 0) return 'new'
    if (column.order === 1) return 'in-progress'
    if (column.order === 2) return 'planned'
    if (column.order === 3) return 'under-review'

    return 'new'
  }

  const handleOpenAddFeatureModal = (column: RoadmapColumn) => {
    setSelectedColumn({
      id: column.id,
      name: column.name,
      status: getColumnStatus(column),
    })
    setNewFeature({
      title: '',
      description: '',
      tagIds: [],
    })
    setAddFeatureModalOpen(true)
  }

  const isLoading = isLoadingOrgs || isLoadingProjects || isLoadingRoadmap || isLoadingUser

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!organizations?.length || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Project Found</h2>
        <p className="text-muted-foreground max-w-md">
          You need to create a project before setting up a roadmap.
        </p>
        <Button className="mt-4" asChild>
          <a href="/projects/new">Create Project</a>
        </Button>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center bg-background rounded-lg">
        <div className="p-6 bg-muted rounded-full mb-6">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Create Your First Roadmap</h2>
        <p className="text-muted-foreground max-w-md">
          Transform your "{project?.name || 'project'}" program with a visual roadmap. Organize
          features, track progress, and keep stakeholders aligned.
        </p>
        <Button className="mt-6" size="lg" asChild>
          <a href="/settings/roadmap">
            <Settings className="mr-2 h-4 w-4" />
            Configure Roadmap
          </a>
        </Button>
      </div>
    )
  }

  const publicUrl =
    roadmap.is_public && roadmap.subdomain
      ? `https://${roadmap.subdomain}.reflect.com/roadmap`
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{roadmap.name || 'Product Roadmap'}</h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your product development progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          {publicUrl && (
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Roadmap
              </a>
            </Button>
          )}
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings/roadmap">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={addFeatureModalOpen} onOpenChange={setAddFeatureModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-lg font-semibold">Add New Feature Request</DialogTitle>
            </div>
            <DialogDescription>
              Create a new feature request that will help improve your product.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Badge variant="outline">{selectedColumn?.status || 'Unknown'}</Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="A short, descriptive title for your feature request"
                value={newFeature.title}
                onChange={(e) => setNewFeature((prev) => ({ ...prev, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide more details about the feature, why it's needed, and how it should work..."
                value={newFeature.description}
                onChange={(e) =>
                  setNewFeature((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Required for better understanding and processing
              </p>
            </div>
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label>
                  Tags <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((tag) => {
                    const isSelected = newFeature.tagIds.includes(tag.id)
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        style={
                          isSelected
                            ? {
                                backgroundColor: tag.color,
                                color: '#fff',
                                borderColor: tag.color,
                              }
                            : {
                                borderColor: tag.color,
                                color: tag.color,
                              }
                        }
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleAddFeature}
              disabled={
                !newFeature.title.trim() ||
                !newFeature.description.trim() ||
                createFeatureMutation.isPending
              }
            >
              {createFeatureMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative">
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          onClick={() => scrollToColumn('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          onClick={() => scrollToColumn('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Kanban Board */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-4 px-12 -mx-12 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 min-w-max px-12">
            {roadmap.columns.map((column) => {
              const columnFeatures = getFeaturesByColumn(column.id)

              return (
                <div
                  key={column.id}
                  className={cn(
                    'flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 transition-colors',
                    dragOverColumn === column.id && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold">{column.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnFeatures.length}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenAddFeatureModal(column)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Feature Cards */}
                  <div className="space-y-3">
                    {/* Feature Cards */}
                    {columnFeatures.map((feature) => (
                      <RoadmapCard
                        key={feature.id}
                        feature={feature}
                        columnId={column.id}
                        roadmapId={roadmap.id}
                        columns={roadmap.columns}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragged={draggedItem?.featureId === feature.id}
                      />
                    ))}

                    {/* Empty State */}
                    {columnFeatures.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No features yet</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleOpenAddFeatureModal(column)}
                          className="mt-2"
                        >
                          Add first feature
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
