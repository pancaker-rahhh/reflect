import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Tag, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapTag } from '@/types'
import { useToast } from '@/components/ui/use-toast'

interface TagManagerProps {
  roadmapId: string
}

interface TagFormData {
  name: string
  color: string
}

export function TagManager({ roadmapId }: TagManagerProps) {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: '#6B7280',
  })
  const [editData, setEditData] = useState<TagFormData>({
    name: '',
    color: '',
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['roadmapTags', roadmapId],
    queryFn: () => api.getRoadmapTags(roadmapId),
    enabled: !!roadmapId,
  })

  const createTagMutation = useMutation({
    mutationFn: (data: TagFormData) =>
      api.createRoadmapTag({
        roadmap_id: roadmapId,
        name: data.name,
        color: data.color,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTags', roadmapId] })
      setFormData({ name: '', color: '#6B7280' })
      setIsAddingTag(false)
      toast({
        title: 'Tag created',
        description: 'New tag has been added successfully.',
      })
    },
    onError: (error) => {
      console.error('Error creating tag:', error)
      toast({
        title: 'Error creating tag',
        description: error.message || 'Failed to create tag. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagFormData }) => api.updateRoadmapTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTags', roadmapId] })
      setEditingTagId(null)
      toast({
        title: 'Tag updated',
        description: 'Tag has been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error updating tag',
        description: error.message || 'Failed to update tag. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => api.deleteRoadmapTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTags', roadmapId] })
      toast({
        title: 'Tag deleted',
        description: 'Tag has been removed successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error deleting tag',
        description: error.message || 'Failed to delete tag. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleAddTag = () => {
    if (formData.name.trim()) {
      const validColor = formData.color.startsWith('#') ? formData.color : `#${formData.color}`
      createTagMutation.mutate({
        name: formData.name.trim(),
        color: validColor,
      })
    }
  }

  const handleUpdateTag = () => {
    if (editingTagId && editData.name.trim()) {
      const validColor = editData.color.startsWith('#') ? editData.color : `#${editData.color}`
      updateTagMutation.mutate({
        id: editingTagId,
        data: {
          name: editData.name.trim(),
          color: validColor,
        },
      })
    }
  }

  const startEditing = (tag: RoadmapTag) => {
    setEditingTagId(tag.id)
    setEditData({
      name: tag.name,
      color: tag.color,
    })
  }

  const cancelEditing = () => {
    setEditingTagId(null)
    setEditData({ name: '', color: '' })
  }

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      deleteTagMutation.mutate(tagId)
    }
  }

  // Predefined color palette for better UX
  const colorPalette = [
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#06B6D4',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#6B7280',
    '#84CC16',
  ]

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Tags Management</CardTitle>
              <CardDescription>
                Organize and categorize your roadmap features with custom tags
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => setIsAddingTag(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inline Tag Creation */}
        {isAddingTag && (
          <div className="p-4 border border-border/50 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-medium">Create New Tag</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tag Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                  className="focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tag Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer hover:scale-110 transition-transform duration-200"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                    placeholder="#000000"
                  />
                </div>
                {/* Color Palette */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded-full border-2 border-border/50 hover:border-foreground transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleAddTag}
                disabled={!formData.name.trim() || createTagMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
              >
                {createTagMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tag
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingTag(false)}
                disabled={createTagMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Tags List */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="h-10 w-10 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tags created yet</h3>
            <p className="text-sm mb-4">
              Create tags to organize and categorize your roadmap features
            </p>
            <Button onClick={() => setIsAddingTag(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create First Tag
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group relative p-4 border border-border/50 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 hover:shadow-md"
              >
                {editingTagId === tag.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tag Name</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tag Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editData.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          className="w-8 h-8 rounded-lg border cursor-pointer hover:scale-110 transition-transform duration-200"
                        />
                        <Input
                          value={editData.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          className="flex-1 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <Button
                        onClick={handleUpdateTag}
                        disabled={!editData.name.trim() || updateTagMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                      >
                        {updateTagMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Update
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEditing}
                        size="sm"
                        disabled={updateTagMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div>
                          <h4 className="font-medium text-foreground">{tag.name}</h4>
                          <p className="text-sm text-muted-foreground">Color: {tag.color}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(tag)}
                        className="hover:bg-amber-500/10 hover:text-amber-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deleteTagMutation.isPending}
                      >
                        {deleteTagMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Usage Statistics */}
        {tags.length > 0 && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <h3 className="text-sm font-medium">Tag Overview</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{tags.length}</div>
                <div className="text-xs text-muted-foreground">Total Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {tags.filter((tag) => tag.color && tag.color !== '#6B7280').length}
                </div>
                <div className="text-xs text-muted-foreground">Custom Colors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(
                    (tags.filter((tag) => tag.name.length > 3).length / tags.length) * 100
                  )}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Well Named</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
