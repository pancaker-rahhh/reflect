import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,

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
import {
  Calendar,
  Loader2,
  ThumbsUp,
  User,
  Mail,
  Tag,
  Trash2,
  X,
  FileText,
  UserCircle,
  Hash,
  Clock,
  MapPin,
  Check,
  Edit2,
} from 'lucide-react'
import { safeFormat } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { RoadmapActionItem, RoadmapColumn } from '@/types'

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
    mutationFn: (data: typeof formData & { id: string }) => {
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
      updateFeatureMutation.mutate({ ...formData, id: feature.id })
    }
  }

  const handleDelete = () => {
    if (feature) {
      // Enhanced delete confirmation with feature preview
      const confirmed = window.confirm(
        `Are you sure you want to delete "${feature.title}"?\n\nThis action cannot be undone and will remove the feature from your roadmap.`
      )
      if (confirmed) {
        deleteFeatureMutation.mutate(feature.id)
      }
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 hover:scale-105"
            >
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="submitter"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 hover:scale-105"
            >
              <UserCircle className="h-4 w-4" />
              Submitter
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 hover:scale-105"
            >
              <Hash className="h-4 w-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Feature description"
                    rows={6}
                    className="resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Column</Label>
                  <Select
                    value={formData.columnId}
                    onValueChange={(value) => setFormData({ ...formData, columnId: value })}
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-primary/20 transition-all duration-200">
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
              </div>
            ) : (
              <div className="space-y-6">
                {/* Description Card */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {feature.description || (
                      <span className="italic text-muted-foreground/70">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>

                {/* Tags Card */}
                {feature.tags && feature.tags.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Tags</h3>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {feature.tags.length}
                      </Badge>
                    </div>
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

                {/* Metadata Card */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Feature Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created by:</span>
                      <span className="font-medium text-foreground">
                        {feature.submitter_name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium text-foreground">
                        {safeFormat(feature.created_at, 'MMM d, yyyy', 'Date unavailable')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-foreground">
                        {getColumnName(feature.column_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Votes:</span>
                      <span className="font-medium text-foreground">{feature.vote_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Support this feature
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpvote}
                      disabled={upvoteMutation.isPending}
                      className={cn(
                        'transition-all duration-200 hover:scale-105',
                        feature.vote_count > 0 && 'border-primary text-primary hover:bg-primary/10'
                      )}
                    >
                      {upvoteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ThumbsUp
                          className={cn(
                            'h-4 w-4 mr-2',
                            feature.vote_count > 0 && 'text-primary fill-primary'
                          )}
                        />
                      )}
                      {feature.vote_count || 0} votes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitter" className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Submitter Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Submitter Name</Label>
                      <Input
                        value={formData.submitterName || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, submitterName: e.target.value })
                        }
                        placeholder="Name of submitter"
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Submitter Email</Label>
                      <Input
                        value={formData.submitterEmail || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, submitterEmail: e.target.value })
                        }
                        placeholder="Email of submitter"
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Submitter Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {feature.submitter_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-muted-foreground">Feature submitter</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-foreground">
                          {feature.submitter_name || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">
                          {feature.submitter_email || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            {isLoadingTags ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading tags...</p>
                </div>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-sm font-medium mb-2">No tags available</h3>
                <p className="text-xs">Create tags in roadmap settings to organize your features</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Feature Tags</h3>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {formData.tagIds.length} selected
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select tags for this feature</Label>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((tag) => {
                        const isSelected = formData.tagIds.includes(tag.id)
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer py-2 px-3 text-sm font-medium transition-all duration-200 hover:scale-105',
                              isSelected ? 'shadow-md' : 'hover:shadow-sm'
                            )}
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
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Feature Tags</h3>
                    {feature.tags && feature.tags.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {feature.tags.length}
                      </Badge>
                    )}
                  </div>
                  {feature.tags && feature.tags.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {feature.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="font-medium border-none px-3 py-2 text-sm shadow-sm"
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
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tags assigned to this feature</p>
                      <p className="text-xs mt-1">Tags help organize and categorize features</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-3 pt-6 border-t border-border/50">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={!formData.title.trim() || updateFeatureMutation.isPending}
                className="px-6 transition-all duration-200 hover:scale-105"
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
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="px-6 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="px-6 transition-all duration-200 hover:scale-105"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Feature
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFeatureMutation.isPending}
                className="px-6 transition-all duration-200 hover:scale-105"
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
              <Button
                variant="ghost"
                onClick={onClose}
                className="px-6 transition-all duration-200 hover:scale-105"
              >
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
