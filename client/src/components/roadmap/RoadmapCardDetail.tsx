import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Loader2, ThumbsUp, User, Mail, Tag, Trash2, X } from 'lucide-react'
import { safeFormat } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { RoadmapFeature, RoadmapColumn } from '@/types'

interface RoadmapCardDetailProps {
  isOpen: boolean
  onClose: () => void
  feature?: RoadmapFeature | null
  roadmapId: string
  columns: RoadmapColumn[]
  onDelete?: (featureId: string) => void
}

export function RoadmapCardDetail({
  isOpen,
  onClose,
  feature,
  roadmapId,
  columns,
  onDelete,
}: RoadmapCardDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    columnId: string
    submitterName?: string
    submitterEmail?: string
    tagIds: string[]
  }>({
    title: '',
    description: '',
    columnId: '',
    submitterName: '',
    submitterEmail: '',
    tagIds: [],
  })

  const queryClient = useQueryClient()

  // Load tags for this roadmap
  const { data: tags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ['roadmapTags', roadmapId],
    queryFn: () => api.getRoadmapTags(roadmapId),
    enabled: !!roadmapId && isOpen,
  })

  // Reset form when feature changes
  useEffect(() => {
    if (feature) {
      console.log('🔍 DEBUG: Feature created_at value:', feature.created_at)
      console.log('🔍 DEBUG: Feature created_at type:', typeof feature.created_at)
      console.log(
        '🔍 DEBUG: Feature created_at constructor:',
        feature.created_at?.constructor?.name
      )
      if (feature.created_at) {
        console.log('🔍 DEBUG: Feature created_at toString():', feature.created_at.toString())
        if (feature.created_at instanceof Date) {
          console.log(
            '🔍 DEBUG: Feature created_at toISOString():',
            feature.created_at.toISOString()
          )
        }
      }
      setFormData({
        title: feature.title || '',
        description: feature.description || '',
        columnId: feature.column_id || '',
        submitterName: feature.submitter_name || '',
        submitterEmail: feature.submitter_email || '',
        tagIds: feature.tags?.map((tag) => tag.id) || [],
      })
    }
  }, [feature])

  const updateFeatureMutation = useMutation({
    mutationFn: (data: typeof formData & { id: string }) => {
      const { id, ...updateData } = data
      return api.updateRoadmapFeature(id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      setIsEditing(false)
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: (featureId: string) => api.deleteRoadmapFeature(featureId),
    onSuccess: (_, featureId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      if (onDelete) onDelete(featureId)
      onClose()
    },
  })

  const upvoteMutation = useMutation({
    mutationFn: (featureId: string) => api.upvoteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    },
  })

  const handleSave = () => {
    if (feature && formData.title.trim()) {
      updateFeatureMutation.mutate({ ...formData, id: feature.id })
    }
  }

  const handleDelete = () => {
    if (feature && confirm('Are you sure you want to delete this feature?')) {
      deleteFeatureMutation.mutate(feature.id)
    }
  }

  const handleUpvote = () => {
    if (feature) {
      upvoteMutation.mutate(feature.id)
    }
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => {
      const hasTag = prev.tagIds.includes(tagId)
      return {
        ...prev,
        tagIds: hasTag ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
      }
    })
  }

  const getColumnName = (id: string) => {
    const column = columns.find((col) => col.id === id)
    return column ? column.name : 'Unknown Column'
  }

  if (!feature) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {isEditing ? (
            <div className="mb-4">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xl font-semibold"
                placeholder="Feature title"
              />
            </div>
          ) : (
            <>
              <DialogTitle className="text-xl">{feature.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>In {getColumnName(feature.column_id)}</span>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                <span>{safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}</span>
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="submitter">Submitter</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Feature description"
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Column</Label>
                  <Select
                    value={formData.columnId}
                    onValueChange={(value) => setFormData({ ...formData, columnId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {feature.description || <span className="italic">No description provided</span>}
                  </p>
                </div>

                {feature.tags && feature.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {feature.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="font-normal border-none"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {feature.submitter_name && (
                      <div className="flex items-center gap-1 mr-4">
                        <User className="h-3 w-3" />
                        <span>{feature.submitter_name}</span>
                      </div>
                    )}
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpvote}
                    disabled={upvoteMutation.isPending}
                    className={cn('text-xs', feature.vote_count > 0 && 'text-primary')}
                  >
                    {upvoteMutation.isPending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-3 w-3 mr-1" />
                    )}
                    {feature.vote_count || 0}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitter" className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Submitter Name</Label>
                  <Input
                    value={formData.submitterName || ''}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    placeholder="Name of submitter"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Submitter Email</Label>
                  <Input
                    value={formData.submitterEmail || ''}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    placeholder="Email of submitter"
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium mb-1">Submitter Name</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {feature.submitter_name || <span className="italic">Not specified</span>}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Submitter Email</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {feature.submitter_email || <span className="italic">Not specified</span>}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            {isLoadingTags ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tags available</p>
                <p className="text-xs mt-1">Create tags in roadmap settings</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-2">
                <Label>Select tags for this feature</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => {
                    const isSelected = formData.tagIds.includes(tag.id)
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer py-1 px-2"
                        style={
                          isSelected
                            ? {
                                backgroundColor: tag.color,
                                color: '#fff',
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
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                {feature.tags && feature.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {feature.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="font-normal border-none"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags assigned to this feature</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={!formData.title.trim() || updateFeatureMutation.isPending}
              >
                {updateFeatureMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFeatureMutation.isPending}
              >
                {deleteFeatureMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
