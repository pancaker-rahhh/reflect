import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Tag, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapTag } from '@/types'

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
    },
    onError: (error) => {
      console.error('Error creating tag:', error)
      // Keep the form open so user can see the error
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagFormData }) => api.updateRoadmapTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTags', roadmapId] })
      setEditingTagId(null)
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => api.deleteRoadmapTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTags', roadmapId] })
    },
  })

  const handleAddTag = () => {
    if (formData.name.trim()) {
      // Ensure color is a valid hex color
      const validColor = formData.color.startsWith('#') ? formData.color : `#${formData.color}`

      console.log('Creating tag with data:', {
        roadmap_id: roadmapId,
        name: formData.name.trim(),
        color: validColor,
      })

      createTagMutation.mutate({
        roadmap_id: roadmapId,
        name: formData.name.trim(),
        color: validColor,
      } as any)
    }
  }

  const startEditing = (tag: RoadmapTag) => {
    setEditingTagId(tag.id)
    setEditData({
      name: tag.name,
      color: tag.color,
    })
  }

  const handleUpdateTag = (id: string) => {
    if (editData.name.trim()) {
      updateTagMutation.mutate({ id, data: editData })
    }
  }

  const cancelEditing = () => {
    setEditingTagId(null)
  }

  const handleDeleteTag = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      deleteTagMutation.mutate(id)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Tags
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTag(true)}
          disabled={isAddingTag || !!editingTagId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tags.length === 0 && !isAddingTag ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No tags yet</p>
            <p className="text-xs mt-1">Tags help organize features in your roadmap</p>
            <Button variant="link" size="sm" className="mt-2" onClick={() => setIsAddingTag(true)}>
              Add your first tag
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Add Tag Form */}
            {isAddingTag && (
              <div className="p-4 bg-muted/40 rounded-lg space-y-3 border">
                <div>
                  <Label htmlFor="tagName" className="text-xs font-medium">
                    Tag Name
                  </Label>
                  <Input
                    id="tagName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tag name"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="tagColor" className="text-xs font-medium">
                    Tag Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="tagColor"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!formData.name.trim() || createTagMutation.isPending}
                  >
                    {createTagMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Add Tag
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingTag(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Tag List */}
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg border',
                    editingTagId === tag.id && 'border-primary bg-primary/5'
                  )}
                >
                  {editingTagId === tag.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editData.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          className="w-6 h-6 rounded border p-0 cursor-pointer"
                        />
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="flex-1 h-7 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTag(tag.id)}
                          disabled={!editData.name.trim() || updateTagMutation.isPending}
                          className="h-7 px-2"
                        >
                          {updateTagMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <Badge
                          variant="outline"
                          className="font-normal border-none px-1.5 py-0"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => startEditing(tag)}
                          disabled={!!editingTagId}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={!!editingTagId || deleteTagMutation.isPending}
                        >
                          {deleteTagMutation.isPending && deleteTagMutation.variables === tag.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
