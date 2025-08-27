import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, organizationApi, userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Settings,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoadmapCard } from '@/components/roadmap/RoadmapCard'
import { AddFeatureModal } from '@/components/roadmap/AddFeatureModal'
import { BulkJiraModal } from '@/components/roadmap/BulkJiraModal'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { RoadmapColumn, RoadmapActionItem } from '@/types'

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
  const [bulkJiraModalOpen, setBulkJiraModalOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<RoadmapActionItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<{
    id: string
    name: string
    status: string
  } | null>(null)
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

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.getIntegrations(),
    enabled: !!project?.id,
  })

  const jiraIntegrations = integrations.filter((integration: any) => integration.type === 'JIRA')

  const createFeatureMutation = useMutation({
    mutationFn: (data: {
      title: string
      description: string
      column_id: string
      tag_ids?: string[]
      submitter_name?: string
      submitter_email?: string
    }) => api.createRoadmapActionItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      setAddFeatureModalOpen(false)
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

  // Add loading state for drag operations
  const isMovingFeature = updateFeatureOrderMutation.isPending

  const handleDragStart = (e: React.DragEvent, featureId: string, sourceColumnId: string) => {
    setDraggedItem({ featureId, sourceColumnId })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', featureId)

    // Add visual feedback
    if (e.target instanceof HTMLElement) {
      e.target.style.transform = 'rotate(2deg) scale(1.05)'
    }
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

    // Reset drag visual feedback
    if (e.target instanceof HTMLElement) {
      e.target.style.transform = ''
    }

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

    // Reset any remaining drag visual feedback
    const draggedElements = document.querySelectorAll('[data-dragging="true"]')
    draggedElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.transform = ''
        el.removeAttribute('data-dragging')
      }
    })
  }

  const toggleTag = (tagId: string) => {
    // This function is no longer needed as AddFeatureModal handles tags
  }

  const handleOpenAddFeatureModal = (column: RoadmapColumn) => {
    setSelectedColumn({
      id: column.id,
      name: column.name,
      status: column.status,
    })
    setAddFeatureModalOpen(true)
  }

  const handleAddFeature = (formData: FeatureFormData) => {
    if (!selectedColumn || !currentUser) return

    createFeatureMutation.mutate({
      title: formData.title,
      description: formData.description,
      column_id: selectedColumn.id,
      tag_ids: formData.tagIds,
      submitter_name: currentUser.name,
      submitter_email: currentUser.email,
    })
  }

  const handleToggleSelection = (feature: RoadmapActionItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((item) => item.id === feature.id)
      if (isSelected) {
        return prev.filter((item) => item.id !== feature.id)
      } else {
        return [...prev, feature]
      }
    })
  }

  const handleSelectAll = () => {
    if (roadmap) {
      const allFeatures = roadmap.columns.flatMap((col) => getFeaturesByColumn(col.id))
      setSelectedItems(allFeatures)
    }
  }

  const handleClearSelection = () => {
    setSelectedItems([])
    setIsSelectionMode(false)
  }

  const handleBulkJiraPush = () => {
    setBulkJiraModalOpen(true)
  }

  const scrollToColumn = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 512 // Column width (320) + gap (64) + padding adjustments (128)
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

  const isLoading = isLoadingOrgs || isLoadingProjects || isLoadingRoadmap || isLoadingUser

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Enhanced loading header skeleton with shimmer */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background via-muted/20 to-background p-6 border border-border/50">
          <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted/30 rounded animate-pulse" />
          <div className="absolute inset-0 loading-shimmer opacity-20" />
        </div>

        {/* Enhanced loading columns skeleton with staggered animations */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-6 px-20 -mx-20">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-muted/20 rounded-xl border border-border/50 p-4 animate-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Column header skeleton */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-5 w-24 bg-muted/50 rounded loading-shimmer" />
                    <div className="h-5 w-8 bg-muted/30 rounded loading-shimmer" />
                  </div>
                  <div className="w-8 h-8 bg-muted/30 rounded loading-shimmer" />
                </div>

                {/* Enhanced cards skeleton with shimmer */}
                <div className="space-y-4">
                  {[1, 2, 3].map((cardIndex) => (
                    <div
                      key={cardIndex}
                      className="bg-muted/30 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-300"
                      style={{ animationDelay: `${index * 150 + cardIndex * 100}ms` }}
                    >
                      <div className="h-4 w-3/4 bg-muted/50 rounded loading-shimmer" />
                      <div className="h-3 w-full bg-muted/40 rounded loading-shimmer" />
                      <div className="h-3 w-2/3 bg-muted/40 rounded loading-shimmer" />
                      <div className="flex justify-between items-center pt-2 border-t border-border/20">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-muted/50 rounded-full loading-shimmer" />
                          <div className="h-3 w-16 bg-muted/40 rounded loading-shimmer" />
                        </div>
                        <div className="h-3 w-8 bg-muted/40 rounded loading-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
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

  const publicUrl = roadmap?.is_public
    ? roadmap.subdomain
      ? `http://localhost:5173/public/r/${roadmap.subdomain}`
      : `http://localhost:5173/public/roadmap/${roadmap.public_slug}`
    : null

  return (
    <div className="space-y-6">
      {/* Enhanced header with subtle background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background via-muted/20 to-background p-6 border border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {roadmap.name || 'Product Roadmap'}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Plan and track your product development progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSelectionMode && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedItems.length} selected</span>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs">
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
                {jiraIntegrations.length > 0 && (
                  <Button
                    onClick={handleBulkJiraPush}
                    disabled={selectedItems.length === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Push to JIRA ({selectedItems.length})
                  </Button>
                )}
              </>
            )}

            {!isSelectionMode && jiraIntegrations.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsSelectionMode(true)}
                className="hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Bulk JIRA
              </Button>
            )}

            {publicUrl && (
              <Button
                variant="outline"
                asChild
                className="hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Roadmap
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              <Link to="/settings/roadmap">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Add Feature Modal */}
      <AddFeatureModal
        isOpen={addFeatureModalOpen}
        onClose={() => setAddFeatureModalOpen(false)}
        onSubmit={handleAddFeature}
        isLoading={createFeatureMutation.isPending}
        columnName={selectedColumn?.name || ''}
        columnStatus={selectedColumn?.status || ''}
        roadmapId={roadmap?.id || ''}
      />

      {/* Bulk JIRA Modal */}
      <BulkJiraModal
        isOpen={bulkJiraModalOpen}
        onClose={() => setBulkJiraModalOpen(false)}
        selectedItems={selectedItems}
        jiraIntegrations={jiraIntegrations}
      />

      <div className="relative">
        {/* Enhanced navigation buttons with better positioning and animations */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 shadow-lg bg-background/95 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 btn-interactive group"
          onClick={() => scrollToColumn('left')}
        >
          <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 shadow-lg bg-background/95 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 btn-interactive group"
          onClick={() => scrollToColumn('right')}
        >
          <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        </Button>

        {/* Kanban Board with enhanced container and smooth scrolling */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 px-32 -mx-32 scrollbar-hide smooth-scroll-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 min-w-max px-32">
              {roadmap.columns.map((column, columnIndex) => {
                const columnFeatures = getFeaturesByColumn(column.id)

                return (
                  <div
                    key={column.id}
                    className={cn(
                      'flex-shrink-0 w-80 bg-gradient-to-b from-background via-card/50 to-muted/20 rounded-xl border border-border/50 shadow-sm transition-all duration-500 ease-out hover:shadow-md hover:border-border/70 scroll-snap-start',
                      dragOverColumn === column.id &&
                        'ring-2 ring-primary/60 ring-offset-2 shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5',
                      'animate-in slide-in-from-left-2 duration-700 hover-lift',
                      columnIndex > 0 && 'delay-[calc(var(--index)*150ms)]'
                    )}
                    style={
                      {
                        '--index': columnIndex,
                        animationDelay: `${columnIndex * 150}ms`,
                      } as React.CSSProperties
                    }
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {/* Enhanced Column Header with better animations */}
                    <div className="flex items-center justify-between mb-6 p-4 pb-3 border-b border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm animate-pulse"
                            style={{ backgroundColor: column.color }}
                          />
                          <h3 className="font-semibold text-base text-foreground text-transition">
                            {column.name}
                          </h3>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border-primary/20 animate-in zoom-in-50 duration-300 hover:scale-105 transition-transform duration-200"
                          style={{ animationDelay: `${columnIndex * 150 + 200}ms` }}
                        >
                          {columnFeatures.length}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 btn-interactive"
                        onClick={() => handleOpenAddFeatureModal(column)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="space-y-4 px-4 pb-4">
                      {/* Loading indicator when moving features */}
                      {isMovingFeature && (
                        <div className="flex items-center justify-center py-4 text-muted-foreground animate-in fade-in-50 duration-200">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-xs">Moving feature...</span>
                        </div>
                      )}

                      {/* Feature Cards with enhanced staggered loading */}
                      {columnFeatures.map((feature, featureIndex) => (
                        <div
                          key={feature.id}
                          className="animate-in slide-in-from-top-2 duration-500 ease-out"
                          style={{
                            animationDelay: `${columnIndex * 150 + featureIndex * 100 + 300}ms`,
                          }}
                        >
                          <RoadmapCard
                            feature={feature}
                            columnId={column.id}
                            roadmapId={roadmap.id}
                            columns={roadmap.columns}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            isDragged={draggedItem?.featureId === feature.id}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedItems.some((item) => item.id === feature.id)}
                            onToggleSelection={handleToggleSelection}
                          />
                        </div>
                      ))}

                      {/* Enhanced Empty State with better animations */}
                      {columnFeatures.length === 0 && (
                        <div
                          className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-gradient-to-br from-muted/20 via-muted/10 to-muted/30 animate-in fade-in-50 duration-700"
                          style={{ animationDelay: `${columnIndex * 150 + 500}ms` }}
                        >
                          {/* Floating icon with subtle animation */}
                          <div className="p-4 bg-muted/40 rounded-full w-fit mx-auto mb-4 animate-in zoom-in-50 duration-500 animate-float">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>

                          {/* Staggered text animations */}
                          <div className="space-y-2 mb-4">
                            <p
                              className="text-sm font-medium animate-in slide-in-from-top-2 duration-300"
                              style={{ animationDelay: `${columnIndex * 150 + 700}ms` }}
                            >
                              No features yet
                            </p>
                            <p
                              className="text-xs text-muted-foreground animate-in slide-in-from-top-2 duration-300"
                              style={{ animationDelay: `${columnIndex * 150 + 800}ms` }}
                            >
                              Get started by adding your first feature
                            </p>
                          </div>

                          {/* Enhanced button with hover effects */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAddFeatureModal(column)}
                            className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-md animate-in slide-in-from-top-2 duration-300 btn-interactive"
                            style={{ animationDelay: `${columnIndex * 150 + 900}ms` }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
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
    </div>
  )
}
