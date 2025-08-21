import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Lightbulb, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import type { RoadmapTag } from '@/types'
import { cn } from '@/lib/utils'

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
  columnStatus,
  roadmapId,
}: AddFeatureModalProps) {
  const [formData, setFormData] = useState<FeatureFormData>({
    title: '',
    description: '',
    tagIds: [],
  })
  const [openTagSelector, setOpenTagSelector] = useState(false)

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

  const selectedTags = tags.filter((tag) => formData.tagIds.includes(tag.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold">Add Feature</DialogTitle>
          </div>
          <DialogDescription>Create a new feature for your product roadmap.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Label>Status:</Label>
            <Badge variant="outline">{formatStatus(columnStatus)}</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="A short, descriptive title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the feature..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Your feedback is valuable for understanding and processing requests.
            </p>
          </div>
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <Popover open={openTagSelector} onOpenChange={setOpenTagSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTagSelector}
                    className="w-full justify-between font-normal"
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedTags.length > 0
                        ? selectedTags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs font-normal border-none px-1.5 py-0.5"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))
                        : 'Select tags...'}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag: RoadmapTag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => handleTagSelect(tag.id)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.tagIds.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {tag.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => onSubmit(formData)}
            disabled={!formData.title.trim() || !formData.description.trim() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
