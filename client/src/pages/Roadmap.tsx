import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  MapPin, Plus, ChevronLeft, ChevronRight, ExternalLink, 
  ThumbsUp, Calendar, GripVertical, X, Loader2 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { FeatureRequest, Roadmap, RoadmapColumn } from '@/types'

interface DragItem {
  featureId: string
  sourceColumnId: string
}

export function RoadmapPage() {
  const [isAddingFeature, setIsAddingFeature] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState({ title: '', description: '' })
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [localFeatures, setLocalFeatures] = useState<FeatureRequest[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const queryClient = useQueryClient()
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects()
  })

  const project = projects?.[0]
  
  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery({
    queryKey: ['roadmap', project?.id],
    queryFn: () => project ? api.getRoadmap(project.id) : null,
    enabled: !!project
  })

  const { data: features = [], isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['features'],
    queryFn: () => api.getFeedback({ type: 'feature' }),
    select: (data) => data.filter(item => item.type === 'feature') as FeatureRequest[]
  })

  // Sync local features with fetched features
  useEffect(() => {
    if (features.length > 0) {
      setLocalFeatures(features)
    }
  }, [features])

  const createFeatureMutation = useMutation({
    mutationFn: (data: { title: string; description: string; columnId: string }) => {
      // In a real app, this would create a feature with the specific column/status
      const newFeature = {
        title: data.title,
        description: data.description,
        status: roadmap?.columns.find(c => c.id === data.columnId)?.status || 'new',
        roadmapColumnId: data.columnId
      }
      return Promise.resolve(newFeature)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      setIsAddingFeature(null)
      setNewFeature({ title: '', description: '' })
    }
  })

  const updateFeatureColumnMutation = useMutation({
    mutationFn: ({ featureId, columnId }: { featureId: string; columnId: string }) => {
      // In a real app, this would update the feature's column/status
      return Promise.resolve({ featureId, columnId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    }
  })

  const upvoteFeatureMutation = useMutation({
    mutationFn: (featureId: string) => api.upvoteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    }
  })

  const handleDragStart = (e: React.DragEvent, featureId: string, columnId: string) => {
    setDraggedItem({ featureId, sourceColumnId: columnId })
    e.dataTransfer.effectAllowed = 'move'
    // Set drag data for Firefox compatibility
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

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    // Only remove highlight if we're leaving the column entirely
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
    
    if (draggedItem && draggedItem.sourceColumnId !== targetColumnId) {
      // Update local state immediately for optimistic update
      const targetColumn = roadmap?.columns.find(c => c.id === targetColumnId)
      if (targetColumn) {
        setLocalFeatures(prev => prev.map(feature => 
          feature.id === draggedItem.featureId 
            ? { ...feature, roadmapColumnId: targetColumnId, status: targetColumn.status }
            : feature
        ))
      }
      
      // Then update the server
      updateFeatureColumnMutation.mutate({
        featureId: draggedItem.featureId,
        columnId: targetColumnId
      })
    }
    
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const handleAddFeature = (columnId: string) => {
    if (newFeature.title.trim()) {
      createFeatureMutation.mutate({
        title: newFeature.title,
        description: newFeature.description,
        columnId
      })
    }
  }

  const scrollToColumn = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Column width + gap
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const getFeaturesByColumn = (columnId: string) => {
    const column = roadmap?.columns.find(c => c.id === columnId)
    if (!column) return []
    
    return localFeatures.filter(feature => {
      // Match by roadmapColumnId or by status
      return feature.roadmapColumnId === columnId || 
             (feature.status === column.status && !feature.roadmapColumnId)
    })
  }

  const isLoading = isLoadingRoadmap || isLoadingFeatures

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!roadmap || !roadmap.columns.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Roadmap Found</h2>
        <p className="text-muted-foreground max-w-md">
          Configure your roadmap columns in the roadmap settings to get started.
        </p>
        <Button className="mt-4" asChild>
          <a href="/settings/roadmap">Configure Roadmap</a>
        </Button>
      </div>
    )
  }

  const publicUrl = roadmap.isPublic && roadmap.subdomain 
    ? `https://${roadmap.subdomain}.reflect.com/roadmap`
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your product development progress
          </p>
        </div>
        {publicUrl && (
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Roadmap
            </a>
          </Button>
        )}
      </div>

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
              const isAddingToColumn = isAddingFeature === column.id
              
              return (
                <div
                  key={column.id}
                  className={cn(
                    "flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 transition-colors",
                    dragOverColumn === column.id && "ring-2 ring-primary ring-offset-2"
                  )}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, column.id)}
                  onDragLeave={(e) => handleDragLeave(e, column.id)}
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
                      onClick={() => setIsAddingFeature(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Feature Cards */}
                  <div className="space-y-3">
                    {/* Add Feature Form */}
                    {isAddingToColumn && (
                      <Card className="p-4 border-primary">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`title-${column.id}`}>Title</Label>
                            <Input
                              id={`title-${column.id}`}
                              placeholder="Feature title"
                              value={newFeature.title}
                              onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                              autoFocus
                            />
                          </div>
                          <div>
                            <Label htmlFor={`desc-${column.id}`}>Description</Label>
                            <Textarea
                              id={`desc-${column.id}`}
                              placeholder="Feature description (optional)"
                              value={newFeature.description}
                              onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddFeature(column.id)}
                              disabled={!newFeature.title.trim() || createFeatureMutation.isPending}
                            >
                              {createFeatureMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Add Feature'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsAddingFeature(null)
                                setNewFeature({ title: '', description: '' })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Feature Cards */}
                    {columnFeatures.map((feature) => (
                      <Card
                        key={feature.id}
                        className={cn(
                          "p-4 cursor-move transition-opacity hover:shadow-md",
                          draggedItem?.featureId === feature.id && "opacity-50"
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, feature.id, column.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm leading-tight">
                              {feature.title}
                            </h4>
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          
                          {feature.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {feature.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(feature.createdAt), 'MMM d')}</span>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2 text-xs",
                                feature.upvotes > 0 && "text-primary"
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                upvoteFeatureMutation.mutate(feature.id)
                              }}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {feature.upvotes}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Empty State */}
                    {columnFeatures.length === 0 && !isAddingToColumn && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No features yet</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setIsAddingFeature(column.id)}
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