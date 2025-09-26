import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ConfirmationModal } from '@/components/common/ConfirmationModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Loader2, ThumbsUp, User, Trash2, X, Clock, MapPin, Check, Edit2 } from 'lucide-react'
import { safeFormat } from '@/lib/date'
import type { RoadmapActionItem, RoadmapColumn } from '@/types'
import { StructuredDescription } from '@/components/common/StructuredDescription'

interface RoadmapCardDetailProps {
  isOpen: boolean
  onClose: () => void
  feature?: RoadmapActionItem | null
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
      if (feature.created_at) {
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
    mutationFn: (data: any) => {
      const { id, ...updateData } = data
      return api.updateRoadmapActionItem(id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      setIsEditing(false)
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: (featureId: string) => api.deleteRoadmapActionItem(featureId),
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
      // Convert camelCase to snake_case for backend compatibility
      const updateData = {
        id: feature.id,
        title: formData.title,
        description: formData.description,
        column_id: formData.columnId, // Convert columnId to column_id
        tag_ids: formData.tagIds,
        submitter_name: formData.submitterName,
        submitter_email: formData.submitterEmail,
      }
      console.log('Saving feature with data:', updateData)
      updateFeatureMutation.mutate(updateData)
    }
  }

  const handleDelete = () => {
    if (feature) {
      setShowDeleteConfirm(true)
    }
  }

  const handleConfirmDelete = () => {
    if (feature) {
      deleteFeatureMutation.mutate(feature.id)
      setShowDeleteConfirm(false)
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

  const getColumnColor = (id: string) => {
    const column = columns.find((col) => col.id === id)
    return column ? column.color : 'gray'
  }

  if (!feature) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <DialogHeader className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-2xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
                placeholder="Feature title"
              />
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: getColumnColor(feature.column_id),
                    color: getColumnColor(feature.column_id),
                    backgroundColor: `${getColumnColor(feature.column_id)}10`,
                  }}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {getColumnName(feature.column_id)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Created {safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-2">{feature.title}</DialogTitle>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: getColumnColor(feature.column_id),
                        color: getColumnColor(feature.column_id),
                        backgroundColor: `${getColumnColor(feature.column_id)}10`,
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {getColumnName(feature.column_id)}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Created {safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Unified Content - No Tabs */}
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Feature title"
                  className="text-lg font-semibold"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Feature description"
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Column Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Column</Label>
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
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          {column.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submitter Information */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Submitter Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={formData.submitterName || ''}
                      onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                      placeholder="Submitter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input
                      value={formData.submitterEmail || ''}
                      onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                      placeholder="Submitter email"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              {isLoadingTags ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tags.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => {
                      const isSelected = formData.tagIds.includes(tag.id)
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer py-1 px-3 text-sm"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: tag.color,
                                  color: '#fff',
                                  borderColor: tag.color,
                                }
                              : {
                                  borderColor: `${tag.color}40`,
                                  color: tag.color,
                                  backgroundColor: `${tag.color}10`,
                                }
                          }
                          onClick={() => toggleTag(tag.id)}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {tag.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Description</Label>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <StructuredDescription
                    description={feature.description || ''}
                    className="text-sm text-muted-foreground leading-relaxed"
                  />
                </div>
              </div>

              {/* Column & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Column</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColumnColor(feature.column_id) }}
                    />
                    <span className="text-sm font-medium">{getColumnName(feature.column_id)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Votes</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{feature.vote_count || 0}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpvote}
                      disabled={upvoteMutation.isPending}
                      className="ml-auto"
                    >
                      {upvoteMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submitter Information */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Submitter</Label>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {feature.submitter_name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feature.submitter_email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {feature.tags && feature.tags.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="font-normal border-none px-2 py-1 text-xs"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          color: tag.color,
                          borderColor: `${tag.color}30`,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Created</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-border/50">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={!formData.title.trim() || updateFeatureMutation.isPending}
                className="px-6"
              >
                {updateFeatureMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="px-6">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="px-6">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Feature
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFeatureMutation.isPending}
                className="px-6"
              >
                {deleteFeatureMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={onClose} className="px-6">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Feature"
        description={`Are you sure you want to delete "${feature?.title}"? This action cannot be undone and will remove the feature from your roadmap.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
        isLoading={deleteFeatureMutation.isPending}
      />
    </Dialog>
  )
}
