import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Loader2,
  Plus,
  Check,
  Lightbulb,
  FileText,
  Hash,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapTag } from '@/types'

interface AddFeatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FeatureFormData) => void
  isLoading: boolean
  columnName: string
  columnStatus: string
  roadmapId: string
}

export interface FeatureFormData {
  title: string
  description: string
  tagIds: string[]
}

const formatStatus = (status: string) => {
  return status.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function AddFeatureModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  columnName,
  columnStatus,
  roadmapId,
}: AddFeatureModalProps) {
  const [formData, setFormData] = useState<FeatureFormData>({
    title: '',
    description: '',
    tagIds: [],
  })

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['roadmapTags', roadmapId],
    queryFn: () => (roadmapId ? api.getRoadmapTags(roadmapId) : []),
    enabled: !!roadmapId,
  })

  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', description: '', tagIds: [] })
    }
  }, [isOpen])

  const handleTagSelect = (tagId: string) => {
    setFormData((prev) => {
      const newTagIds = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId]
      return { ...prev, tagIds: newTagIds }
    })
  }

  const selectedTags = tags.filter((tag: RoadmapTag) => formData.tagIds.includes(tag.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <DialogHeader className="space-y-6 pb-6 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Add New Feature Request
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Create a new feature request that will help improve your product and roadmap
                planning.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Title Section */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all duration-200 hover:border-border/70 hover:bg-muted/40">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold text-foreground">
                Feature Title <span className="text-destructive">*</span>
              </Label>
            </div>
            <Input
              id="title"
              placeholder="A short, descriptive title for your feature request"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50 hover:border-border/70"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Keep it concise but descriptive - this will be the main identifier for your feature.
            </p>
          </div>

          {/* Description Section */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all duration-200 hover:border-border/70 hover:bg-muted/40">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold text-foreground">
                Feature Description <span className="text-destructive">*</span>
              </Label>
            </div>
            <Textarea
              id="description"
              placeholder="Provide more details about the feature, why it's needed, and how it should work..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={5}
              className="focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50 hover:border-border/70 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Required for better understanding and processing of your request.
              </p>
              <div
                className={cn(
                  'text-xs transition-colors duration-200',
                  formData.description.length > 800 ? 'text-amber-600' : 'text-muted-foreground'
                )}
              >
                {formData.description.length}/1000
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {tags.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all duration-200 hover:border-border/70 hover:bg-muted/40">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold text-foreground">
                  Tags <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                {selectedTags.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 animate-in slide-in-from-top-2 duration-200"
                  >
                    {selectedTags.length} selected
                  </Badge>
                )}
              </div>

              {/* Simple Tag Selection */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: RoadmapTag) => {
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
                        onClick={() => handleTagSelect(tag.id)}
                      >
                        {isSelected && <Check className="h-3 w-3 mr-1" />}
                        {tag.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Click on tags to select/deselect them. Tags help organize and categorize features
                for better roadmap management.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-border/50">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="px-6 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => onSubmit(formData)}
            disabled={!formData.title.trim() || !formData.description.trim() || isLoading}
            className="px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Feature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
