import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, MapPin, Tag, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAppContext } from '@/context/AppContext'
import type { RoadmapColumn } from '@/types'

interface ConversionData {
  column_id: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  conversion_notes?: string
  custom_tags?: string[]
}

interface FeedbackConversionModalProps {
  isOpen: boolean
  onClose: () => void
  onConvert: (conversionData: ConversionData) => Promise<void>
  feedback: {
    id: string
    feedback_type: string
    title: string
    message?: string
  }
  isBulk?: boolean
  selectedCount?: number
}

export function FeedbackConversionModal({
  isOpen,
  onClose,
  onConvert,
  feedback,
  isBulk = false,
  selectedCount = 1,
}: FeedbackConversionModalProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [priority, setPriority] = useState<string>('medium')
  const [conversionNotes, setConversionNotes] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const { toast } = useToast()
  const { currentProject } = useAppContext()

  const { data: roadmap } = useQuery({
    queryKey: ['roadmap', currentProject?.id],
    queryFn: () => api.getRoadmap(currentProject!.id),
    enabled: isOpen && !!currentProject?.id,
  })

  const { data: existingTags = [] } = useQuery({
    queryKey: ['roadmap-tags', roadmap?.id],
    queryFn: () => api.getRoadmapTags(roadmap!.id),
    enabled: isOpen && !!roadmap?.id,
  })

  const columns =
    roadmap?.columns?.sort((a: RoadmapColumn, b: RoadmapColumn) => a.order - b.order) || []

  useEffect(() => {
    if (isOpen) {
      setSelectedColumn('')
      setPriority('medium')
      setConversionNotes('')
      setCustomTags([])
      setTagInput('')
    }
  }, [isOpen])

  const handleConvert = async () => {
    if (!selectedColumn) {
      toast({
        title: 'Column Required',
        description: 'Please select a column to convert the feedback to.',
        variant: 'destructive',
      })
      return
    }

    setIsConverting(true)
    try {
      await onConvert({
        column_id: selectedColumn,
        priority: priority as 'low' | 'medium' | 'high' | 'critical',
        conversion_notes: conversionNotes || undefined,
        custom_tags: customTags.length > 0 ? customTags : undefined,
      })

      toast({
        title: isBulk ? 'Feedback Converted' : 'Feedback Converted',
        description: isBulk
          ? `Successfully converted ${selectedCount} feedback items to roadmap.`
          : 'Feedback has been converted to a roadmap item.',
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Conversion Failed',
        description: 'Failed to convert feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConverting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      setCustomTags([...customTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove))
  }

  const toggleExistingTag = (tagName: string) => {
    if (customTags.includes(tagName)) {
      removeTag(tagName)
    } else {
      setCustomTags([...customTags, tagName])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `Convert ${selectedCount} Feedback Items` : 'Convert to Roadmap'}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? 'Select a column to convert the selected feedback items to roadmap features.'
              : 'Convert this feedback into a roadmap feature for tracking and development.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Preview */}
          {!isBulk && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{feedback.feedback_type}</Badge>
              </div>
              <h4 className="font-medium">{feedback.title}</h4>
              {feedback.message && feedback.message !== feedback.title && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {feedback.message}
                </p>
              )}
            </div>
          )}

          {/* Column Selection */}
          <div className="space-y-2">
            <Label htmlFor="column" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Roadmap Column *
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column: RoadmapColumn) => (
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
            {columns.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>No roadmap columns found. Please create a roadmap first.</span>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>

            {/* Existing Roadmap Tags */}
            {existingTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Select from existing tags:</Label>
                <div className="flex flex-wrap gap-2">
                  {existingTags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant={customTags.includes(tag.name) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleExistingTag(tag.name)}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Tags */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Or add a new tag:</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Tags */}
            {customTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Selected tags:</Label>
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="notes">Description (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a description for this roadmap item..."
              value={conversionNotes}
              onChange={(e) => setConversionNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConverting}>
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !selectedColumn || columns.length === 0}
          >
            {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBulk ? `Convert ${selectedCount} Items` : 'Convert to Roadmap'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
