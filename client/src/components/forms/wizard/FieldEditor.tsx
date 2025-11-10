import { useState, useEffect, useCallback, useRef } from 'react'
import { Trash, GripVertical, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import type { FormFieldV2, FormFieldCreate } from '@/types'

interface FieldEditorProps {
  field: FormFieldV2
  isExpanded: boolean
  onToggleExpand: () => void
  onSave: (data: Partial<FormFieldCreate>) => void
  onDelete: () => void
  dragHandleProps?: any
}

export function FieldEditor({
  field,
  isExpanded,
  onToggleExpand,
  onSave,
  onDelete,
  dragHandleProps,
}: FieldEditorProps) {
  const getChoicesFromConfig = (config: any) => {
    if (Array.isArray(config)) {
      // Config is array of {key, value} objects
      const choicesConfig = config.find((c: any) => c.key === 'choices')
      return choicesConfig?.value || []
    }
    return []
  }

  const getMultipleFromConfig = (config: any) => {
    if (Array.isArray(config)) {
      const multipleConfig = config.find((c: any) => c.key === 'multiple')
      return multipleConfig?.value || false
    }
    return false
  }

  const [label, setLabel] = useState(field.label)
  const [isRequired, setIsRequired] = useState(field.is_required)
  const [choices, setChoices] = useState<string[]>(getChoicesFromConfig(field.config))
  const [multiple, setMultiple] = useState(getMultipleFromConfig(field.config))

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  const previousFieldRef = useRef(field)

  // Reset state when field changes from outside (e.g., after save)
  useEffect(() => {
    const currentChoices = getChoicesFromConfig(field.config)
    const currentMultiple = getMultipleFromConfig(field.config)

    // Only update if field actually changed from backend
    if (
      field.id !== previousFieldRef.current.id ||
      field.label !== previousFieldRef.current.label ||
      field.is_required !== previousFieldRef.current.is_required ||
      JSON.stringify(getChoicesFromConfig(previousFieldRef.current.config)) !==
        JSON.stringify(currentChoices) ||
      getMultipleFromConfig(previousFieldRef.current.config) !== currentMultiple
    ) {
      setLabel(field.label)
      setIsRequired(field.is_required)
      setChoices(currentChoices)
      setMultiple(currentMultiple)
      previousFieldRef.current = field
    }
  }, [field])

  // Auto-save with debouncing
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      const data: Partial<FormFieldCreate> = {
        field_type: field.field_type,
        label,
        is_required: isRequired,
        ...(field.field_type === 'choice' && { choices, multiple }),
      }
      onSave(data)
    }, 500) // 500ms debounce
  }, [field.field_type, label, isRequired, choices, multiple, onSave, field])

  // Trigger save when any field changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Compare with current field values to detect changes
    const currentChoices = getChoicesFromConfig(field.config)
    const currentMultiple = getMultipleFromConfig(field.config)

    const hasChanges =
      field.label !== label ||
      field.is_required !== isRequired ||
      JSON.stringify(currentChoices) !== JSON.stringify(choices) ||
      currentMultiple !== multiple

    if (hasChanges) {
      triggerSave()
    }
  }, [label, isRequired, choices, multiple, triggerSave, field])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      number: 'Number',
      choice: multiple ? 'Multiple Choice (Multi-select)' : 'Multiple Choice (Single-select)',
    }
    return labels[type] || type
  }

  return (
    <Card className="p-4 group transition-colors">
      {/* Header - Always visible */}
      <div className="flex items-start gap-3">
        <div
          {...dragHandleProps}
          className="text-muted-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {label || field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {getFieldTypeLabel(field.field_type)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleExpand} className="h-8 w-8">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Edit Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <Label className="text-xs">Question</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter question"
              className="mt-1.5"
            />
          </div>

          {field.field_type === 'choice' && (
            <div>
              <Label className="text-xs">Choices</Label>
              <div className="space-y-2 mt-1.5">
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...choices]
                        newChoices[idx] = e.target.value
                        setChoices(newChoices)
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setChoices(choices.filter((_, i) => i !== idx))}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChoices([...choices, ''])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Choice
                </Button>
              </div>
            </div>
          )}

          {field.field_type === 'choice' && (
            <div className="flex items-center gap-2">
              <Switch checked={multiple} onCheckedChange={(checked) => setMultiple(checked)} />
              <Label className="text-xs">Allow multiple selections</Label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={isRequired} onCheckedChange={(checked) => setIsRequired(checked)} />
            <Label className="text-xs">Required</Label>
          </div>
        </div>
      )}
    </Card>
  )
}
