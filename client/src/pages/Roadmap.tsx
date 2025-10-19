import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, userApi } from '@/lib/api'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Plus,
  CaretLeft,
  CaretRight,
  ArrowSquareOut,
  Spinner,
  Gear,
  CheckSquare,
  DotsSixVertical,
} from 'phosphor-react'
import { cn } from '@/lib/utils'
import { RoadmapCard } from '@/components/roadmap/RoadmapCard'
import { AddFeatureModal } from '@/components/roadmap/AddFeatureModal'
import { BulkJiraModal } from '@/components/roadmap/BulkJiraModal'
import { IndividualJiraModal } from '@/components/roadmap/IndividualJiraModal'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { urlBuilder } from '@/config'
import type { RoadmapColumn, RoadmapActionItem, Integration } from '@/types'

interface DragItem {
  featureId: string
  sourceColumnId: string
}

interface FeatureFormData {
  title: string
  description: string
  tagIds: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
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
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [, setIsReordering] = useState(false)
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

  const { currentProject, isLoading: isLoadingApp } = useAppContext()

  const {
    data: roadmap,
    isLoading: isLoadingRoadmap,
    error: roadmapError,
  } = useQuery({
    queryKey: ['roadmap', currentProject?.id],
    queryFn: () => {
      if (!currentProject?.id) {
        return Promise.resolve(null)
      }
      return api.getRoadmap(currentProject.id)
    },
    enabled: !!currentProject?.id,
  })

  console.log('Roadmap Debug:', {
    currentProject,
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
      queryClient.invalidateQueries({ queryKey: ['roadmap', currentProject?.id] })
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
    queryKey: ['integrations', currentProject?.id],
    queryFn: () => {
      if (!currentProject?.id) {
        return Promise.resolve([])
      }
      return api.getIntegrations(currentProject.id)
    },
    enabled: !!currentProject?.id,
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
      priority?: string
      submitter_name?: string
      submitter_email?: string
    }) => api.createRoadmapActionItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', currentProject?.id] })
      setAddFeatureModalOpen(false)
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
      queryClient.invalidateQueries({ queryKey: ['roadmap', currentProject?.id] })
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

  const updateColumnOrderMutation = useMutation({
    mutationFn: (updates: { id: string; order: number }[]) => api.updateColumnsOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', currentProject?.id] })
    },
    onError: (error) => {
      console.error('Error updating column order:', error)
      toast({
        title: 'Error reordering columns',
        description: error.message || 'There was a problem reordering columns.',
        variant: 'destructive',
      })
    },
  })

  const isMovingFeature = updateFeatureOrderMutation.isPending

  const handleDragStart = (e: React.DragEvent, featureId: string, sourceColumnId: string) => {
    setDraggedItem({ featureId, sourceColumnId })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', featureId)

    if (e.target instanceof HTMLElement) {
      const dragImage = e.target.cloneNode(true) as HTMLElement
      dragImage.style.transform = 'rotate(5deg)'
      dragImage.style.opacity = '0.9'
      dragImage.style.border = '2px solid #3b82f6'
      dragImage.style.borderRadius = '8px'
      dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)'
      dragImage.style.pointerEvents = 'none'
      dragImage.style.position = 'absolute'
      dragImage.style.top = '-1000px'
      dragImage.style.left = '-1000px'
      dragImage.style.zIndex = '9999'

      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 0, 0)

      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      }, 0)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)

    const draggedElements = document.querySelectorAll('[data-dragging="true"]')
    draggedElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = ''
        el.removeAttribute('data-dragging')
      }
    })
  }

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId)
    setIsReordering(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)

    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.7'
  }

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedItem && draggedItem.sourceColumnId !== columnId) {
      setDragOverColumn(columnId)
    } else if (draggedColumn && draggedColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleColumnDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    if (draggedItem && draggedItem.sourceColumnId !== columnId) {
      setDragOverColumn(columnId)
    } else if (draggedColumn && draggedColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleColumnDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement

    if (!currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedItem && draggedItem.sourceColumnId !== targetColumnId && roadmap) {
      const sourceColumn = roadmap.columns.find((col: any) => col.id === draggedItem.sourceColumnId)
      const targetColumn = roadmap.columns.find((col: any) => col.id === targetColumnId)

      if (sourceColumn && targetColumn) {
        const sourceFeatures = getFeaturesByColumn(draggedItem.sourceColumnId)
        const targetFeatures = getFeaturesByColumn(targetColumnId)

        const featureToMove = sourceFeatures.find((f: any) => f.id === draggedItem.featureId)

        if (featureToMove) {
          const updates = []

          updates.push({
            id: featureToMove.id,
            column_id: targetColumnId,
            order: targetFeatures.length,
          })

          sourceFeatures
            .filter((f: any) => f.id !== draggedItem.featureId)
            .forEach((feature: any, index: number) => {
              updates.push({
                id: feature.id,
                order: index,
              })
            })

          updateFeatureOrderMutation.mutate(updates)
        }
      }
    } else if (draggedColumn && draggedColumn !== targetColumnId && roadmap) {
      const sortedColumns = [...roadmap.columns].sort((a: any, b: any) => a.order - b.order)
      const sourceIndex = sortedColumns.findIndex((col: any) => col.id === draggedColumn)
      const targetIndex = sortedColumns.findIndex((col: any) => col.id === targetColumnId)

      if (sourceIndex === -1 || targetIndex === -1) return

      const newOrder = [...sortedColumns]
      const draggedColumnData = newOrder[sourceIndex]
      newOrder.splice(sourceIndex, 1)
      newOrder.splice(targetIndex, 0, draggedColumnData)

      const updates = newOrder.map((col: any, index: number) => ({
        id: col.id,
        order: index,
      }))

      updateColumnOrderMutation.mutate(updates)
    }

    setDraggedItem(null)
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  const handleColumnDragEnd = () => {
    setDraggedColumn(null)
    setDragOverColumn(null)
    setIsReordering(false)

    const draggedElements = document.querySelectorAll('[data-dragging="true"]')
    draggedElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = ''
        el.removeAttribute('data-dragging')
      }
    })

    const columns = document.querySelectorAll('[data-column-id]')
    columns.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = ''
      }
    })
  }

  const getColumnSlideStyle = (_column: any) => {
    return {}
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
      priority: formData.priority,
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

    const priorityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    }

    return [...features].sort((a, b) => {
      const aPriority = priorityOrder[a.priority || ''] || 0
      const bPriority = priorityOrder[b.priority || ''] || 0

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      return a.order - b.order
    })
  }

  const isLoading = false || false || isLoadingRoadmap || isLoadingUser

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

  if (isLoadingApp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!currentProject) {
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
          Transform your "{currentProject?.name || 'currentProject'}" program with a visual roadmap.
          Organize features, track progress, and keep stakeholders aligned.
        </p>
        <Button className="mt-6" size="lg" asChild>
          <a href="/settings/roadmap">
            <Gear className="mr-2 h-4 w-4" />
            Configure Roadmap
          </a>
        </Button>
      </div>
    )
  }

  const publicUrl = roadmap?.is_public
    ? urlBuilder.publicRoadmap(roadmap.subdomain, roadmap.public_slug)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{roadmap.name || 'Product Roadmap'}</h1>
            <p className="mt-2 text-lg">Plan and track your product development progress</p>
          </div>
          <div className="flex items-center gap-2">
            {isSelectionMode && (
              <>
                <div className="flex items-center gap-2 text-sm">
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
                    className="bg-blue-600 hover:bg-blue-700"
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
                className="hover:bg-gray-50"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Bulk JIRA
              </Button>
            )}

            {publicUrl && (
              <Button variant="outline" asChild className="hover:bg-gray-50">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ArrowSquareOut className="mr-2 h-4 w-4" />
                  View Public Roadmap
                </a>
              </Button>
            )}
            <Button variant="outline" size="icon" asChild className="hover:bg-border">
              <Link to="/app/settings/roadmap">
                <Gear className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Roadmap Board */}
      <div className="space-y-4">
        {/* Kanban Board with enhanced container and smooth scrolling */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">Drag columns by the grip icon to reorder them</p>
          </div>
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 scrollbar-hide smooth-scroll-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 min-w-max">
              {roadmap.columns
                .sort((a: any, b: any) => a.order - b.order)
                .map((column: any, _columnIndex: number) => {
                  const columnFeatures = getFeaturesByColumn(column.id)
                  const slideStyle = getColumnSlideStyle(column)

                  return (
                    <div
                      key={column.id}
                      data-column-id={column.id}
                      className={cn(
                        'flex-shrink-0 w-80 rounded-lg border shadow-sm scroll-snap-start relative cursor-grab active:cursor-grabbing',
                        dragOverColumn === column.id &&
                          draggedItem &&
                          draggedItem.sourceColumnId !== column.id &&
                          'ring-2 ring-primary ring-offset-2 shadow-lg border-primary',
                        dragOverColumn === column.id &&
                          draggedColumn &&
                          draggedColumn !== column.id &&
                          'ring-2 ring-primary ring-offset-2 shadow-lg',
                        draggedColumn === column.id && 'opacity-70'
                      )}
                      style={{
                        ...slideStyle,
                        ...getColumnSlideStyle(column),
                      }}
                      draggable
                      onDragStart={(e) => handleColumnDragStart(e, column.id)}
                      onDragOver={(e) => handleColumnDragOver(e, column.id)}
                      onDragEnter={(e) => handleColumnDragEnter(e, column.id)}
                      onDragLeave={handleColumnDragLeave}
                      onDrop={(e) => handleColumnDrop(e, column.id)}
                      onDragEnd={handleColumnDragEnd}
                    >
                      {/* Drop indicator for column reordering */}
                      {dragOverColumn === column.id &&
                        draggedColumn &&
                        draggedColumn !== column.id && (
                          <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-lg z-10 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                              Drop here
                            </div>
                          </div>
                        )}

                      {/* Column Header */}
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <DotsSixVertical className="h-5 w-5 cursor-grab" />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: column.color }}
                            />
                            <h3 className="font-semibold text-base">{column.name}</h3>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium px-2 py-1 tint-info"
                          >
                            {columnFeatures.length}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-border"
                          onClick={() => handleOpenAddFeatureModal(column)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Feature Cards */}
                      <div className="space-y-3 p-4">
                        {/* Loading indicator when moving features */}
                        {isMovingFeature && (
                          <div className="flex items-center justify-center py-4">
                            <Spinner className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-xs">Moving feature...</span>
                          </div>
                        )}

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
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedItems.some((item) => item.id === feature.id)}
                            onToggleSelection={handleToggleSelection}
                            jiraIntegrations={jiraIntegrations}
                            onConvertToJira={handleConvertToJira}
                          />
                        ))}

                        {/* Empty State */}
                        {columnFeatures.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <p className="text-sm font-medium">No features yet</p>
                            <p className="text-xs mt-1">Get started by adding your first feature</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 rounded-lg p-2 border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToColumn('left')}
              className="h-8 w-8 p-0 hover:bg-border"
            >
              <CaretLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {roadmap.columns
                .sort((a: any, b: any) => a.order - b.order)
                .map((_, index) => (
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
                    className="w-2 h-2 rounded-full bg-muted-foreground hover:bg-primary"
                  />
                ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToColumn('right')}
              className="h-8 w-8 p-0 hover:bg-border"
            >
              <CaretRight className="h-4 w-4" />
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
          <p className="mb-4">An unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}
