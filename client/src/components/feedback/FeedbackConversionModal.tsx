import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Tag, ArrowRight, CheckCircle } from 'lucide-react'
import { type ConversionPreview } from '@/lib/api'
import type { ConversionData } from '@/lib/api/feedback'

interface FeedbackConversionModalProps {
  isOpen: boolean
  onClose: () => void
  feedback: {
    id: string
    feedback_type: string
    title?: string
    message?: string
  }
  onConvert: (data: ConversionData) => Promise<void>
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
]

export const FeedbackConversionModal: React.FC<FeedbackConversionModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onConvert,
}) => {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [conversionNotes, setConversionNotes] = useState<string>('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState<string>('')
  const [preview, setPreview] = useState<ConversionPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSuccess, setConversionSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && feedback) {
      loadConversionPreview()
      // Set default priority based on feedback type
      setPriority(
        getDefaultPriority(feedback.feedback_type) as 'low' | 'medium' | 'high' | 'critical'
      )
    }
  }, [isOpen, feedback])

  const loadConversionPreview = async () => {
    if (!feedback?.id) return

    try {
      setIsLoading(true)
      const { api } = await import('@/lib/api')
      const previewData = await api.getConversionPreview(feedback.id)
      setPreview(previewData)
    } catch (error) {
      console.error('Failed to load conversion preview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultPriority = (feedbackType: string): string => {
    switch (feedbackType) {
      case 'bug_report':
        return 'high'
      case 'feature_request':
        return 'medium'
      case 'review':
      case 'nps':
      case 'csat':
      case 'ces':
        return 'medium'
      default:
        return 'medium'
    }
  }

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove))
  }

  const handleConvert = async () => {
    if (!priority) return

    try {
      setIsConverting(true)
      await onConvert({
        priority,
        conversion_notes: conversionNotes || undefined,
        custom_tags: customTags.length > 0 ? customTags : undefined,
      })
      setConversionSuccess(true)
      setTimeout(() => {
        onClose()
        setConversionSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleClose = () => {
    if (!isConverting) {
      setPriority('medium')
      setConversionNotes('')
      setCustomTags([])
      setNewTag('')
      setPreview(null)
      setConversionSuccess(false)
      onClose()
    }
  }

  if (!feedback) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Convert Feedback to Action Item
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Conversion Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority Selection */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as 'low' | 'medium' | 'high' | 'critical')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>{option.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Tags */}
                <div className="space-y-2">
                  <Label>Custom Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomTag}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeCustomTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Conversion Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Conversion Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this conversion..."
                    value={conversionNotes}
                    onChange={(e) => setConversionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleConvert}
                disabled={!priority || isConverting}
                className="flex-1"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Convert to Action Item
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isConverting}>
                Cancel
              </Button>
            </div>

            {conversionSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>Successfully converted to action item!</span>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : preview ? (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                      <p className="text-lg font-semibold mt-1">{preview.suggested_title}</p>
                    </div>

                    {/* Description */}
                    {preview.suggested_description && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Description
                        </Label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {preview.suggested_description}
                        </p>
                      </div>
                    )}

                    {/* Auto-generated Tags */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Auto-generated Tags
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {preview.suggested_tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Custom Tags */}
                    {customTags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Custom Tags
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {customTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Priority
                        </Label>
                        <p className="text-sm mt-1 capitalize">{preview.suggested_priority}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                        <p className="text-sm mt-1">{preview.suggested_tags.length} tags</p>
                      </div>
                    </div>

                    {/* Destination Info */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Destination:</strong> This item will be created in the "Backlog"
                        column of your roadmap with the selected priority and tags.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Preview not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
