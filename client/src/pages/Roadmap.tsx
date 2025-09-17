import { useState, useRef, useEffect } from 'react'
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
import { IndividualJiraModal } from '@/components/roadmap/IndividualJiraModal'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { RoadmapColumn, RoadmapActionItem, Integration } from '@/types'

interface DragItem {
  featureId: string
  sourceColumnId: string
}

interface FeatureFormData {
  title: string
  description: string
  tagIds: string[]
}

function RoadmapPageContent() {
  const [addFeatureModalOpen, setAddFeatureModalOpen] = useState(false)
  const [bulkJiraModalOpen, setBulkJiraModalOpen] = useState(false)
  const [individualJiraModalOpen, setIndividualJiraModalOpen] = useState(false)
  const [selectedFeatureForJira, setSelectedFeatureForJira] = useState<RoadmapActionItem | null>(
    null
  )
  const [selectedItems, setSelectedItems] = useState<RoadmapActionItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<{
    id: string
    name: string
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
    queryFn: () => {
      if (!organizationId) {
        return Promise.resolve(null)
      }
      return api.getProjectsByOrganization(organizationId)
    },
    enabled: !!organizationId,
  })

  const project = projectsData?.items?.[0]

  const {
    data: roadmap,
    isLoading: isLoadingRoadmap,
    error: roadmapError,
  } = useQuery({
    queryKey: ['roadmap', project?.id],
    queryFn: () => {
      if (!project?.id) {
        return Promise.resolve(null)
      }
      return api.getRoadmap(project.id)
    },
    enabled: !!project?.id,
  })

  // Debug logging
  console.log('Roadmap Debug:', {
    project,
    roadmap,
    isLoadingRoadmap,
    roadmapError,
    hasColumns: roadmap?.columns?.length || 0,
  })

  const createDefaultColumnsMutation = useMutation({
    mutationFn: async () => {
      if (!roadmap?.id) return

      const defaultColumns = [
        { name: 'New', color: '#94A3B8', order: 0 },
        { name: 'In Progress', color: '#3B82F6', order: 1 },
        { name: 'Planned', color: '#8B5CF6', order: 2 },
        { name: 'Completed', color: '#10B981', order: 3 },
      ]

      const promises = defaultColumns.map((column) =>
        api.createRoadmapColumn({
          roadmap_id: roadmap.id,
          ...column,
        })
      )

      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', project?.id] })
      toast({
        title: 'Default columns created',
        description: 'Your roadmap now has the standard workflow columns.',
      })
    },
    onError: (error) => {
      console.error('Error creating default columns:', error)
      toast({
        title: 'Error creating columns',
        description: 'Failed to create default columns. Please try again.',
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    if (roadmap && roadmap.columns.length === 0 && !createDefaultColumnsMutation.isPending) {
      createDefaultColumnsMutation.mutate()
    }
  }, [roadmap, createDefaultColumnsMutation])

  const {
    data: integrations = [],
    isLoading: _isLoadingIntegrations,
    error: _integrationsError,
  } = useQuery({
    queryKey: ['integrations', project?.id],
    queryFn: () => {
      if (!project?.id) {
        return Promise.resolve([])
      }
      return api.getIntegrations(project.id)
    },
    enabled: !!project?.id,
  })

  const jiraIntegrations = integrations.filter(
    (integration: Integration) =>
      integration.integration_type === 'jira' || integration.type === 'JIRA'
  )

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
      queryClient.invalidateQueries({ queryKey: ['roadmap', project?.id] })
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
      queryClient.invalidateQueries({ queryKey: ['roadmap', project?.id] })
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
      const sourceColumn = roadmap.columns.find((col: any) => col.id === draggedItem.sourceColumnId)
      const targetColumn = roadmap.columns.find((col: any) => col.id === targetColumnId)

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

  const handleOpenAddFeatureModal = (column: RoadmapColumn) => {
    setSelectedColumn({
      id: column.id,
      name: column.name,
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

  const handleConvertToJira = (feature: RoadmapActionItem) => {
    setSelectedFeatureForJira(feature)
    setIndividualJiraModalOpen(true)
  }

  const handleSelectAll = () => {
    if (roadmap) {
      const allFeatures = roadmap.columns.flatMap((col: any) => getFeaturesByColumn(col.id))
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

    const column = roadmap.columns.find((c: any) => c.id === columnId)
    if (!column) return []

    const features = column.action_items || []
    return [...features].sort((a, b) => a.order - b.order)
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
              <Link to="/app/settings/roadmap">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Roadmap Board */}
      <div className="space-y-4">
        {/* Kanban Board with enhanced container and smooth scrolling */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 scrollbar-hide smooth-scroll-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 min-w-max">
              {roadmap.columns.map((column: any, columnIndex: any) => {
                const columnFeatures = getFeaturesByColumn(column.id)

                return (
                  <div
                    key={column.id}
                    className={cn(
                      'flex-shrink-0 w-80 bg-gradient-to-b from-background via-card/50 to-muted/20 rounded-xl border border-border/50 shadow-sm transition-all duration-500 ease-out hover:shadow-md hover:border-border/70 scroll-snap-start',
                      dragOverColumn === column.id &&
                        'ring-2 ring-primary/60 ring-offset-2 shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5',
                      'animate-in slide-in-from-left-2 duration-700 hover-lift'
                    )}
                    style={{
                      animationDelay: `${columnIndex * 150}ms`,
                    }}
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
                            jiraIntegrations={jiraIntegrations}
                            onConvertToJira={handleConvertToJira}
                          />
                        </div>
                      ))}

                      {/* Enhanced Empty State with better animations */}
                      {columnFeatures.length === 0 && (
                        <div
                          className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-gradient-to-br from-muted/20 via-muted/10 to-muted/30 animate-in fade-in-50 duration-700"
                          style={{ animationDelay: `${columnIndex * 150 + 500}ms` }}
                        >
                          {/* Staggered text animations */}
                          <div className="space-y-2">
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
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Custom Horizontal Slider */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-muted/30 rounded-full p-2 border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToColumn('left')}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {roadmap.columns.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const columnWidth = 320 + 24 // column width + gap
                      scrollContainerRef.current.scrollTo({
                        left: index * columnWidth,
                        behavior: 'smooth',
                      })
                    }
                  }}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30 hover:bg-primary/60 transition-colors duration-200"
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToColumn('right')}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
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
        columnStatus={selectedColumn?.name || ''}
        roadmapId={roadmap?.id || ''}
      />

      {/* Bulk JIRA Modal */}
      <BulkJiraModal
        isOpen={bulkJiraModalOpen}
        onClose={() => setBulkJiraModalOpen(false)}
        selectedItems={selectedItems}
        jiraIntegrations={jiraIntegrations}
      />

      {/* Individual JIRA Modal */}
      {selectedFeatureForJira && (
        <IndividualJiraModal
          isOpen={individualJiraModalOpen}
          onClose={() => {
            setIndividualJiraModalOpen(false)
            setSelectedFeatureForJira(null)
          }}
          feature={selectedFeatureForJira}
          jiraIntegrations={jiraIntegrations}
        />
      )}
    </div>
  )
}

export function RoadmapPage() {
  try {
    return <RoadmapPageContent />
  } catch (error) {
    console.error('Roadmap page error:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}
