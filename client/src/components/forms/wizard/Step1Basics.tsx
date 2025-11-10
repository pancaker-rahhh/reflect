import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import type { FormFieldV2 } from '@/types'
import { FieldEditor } from './FieldEditor'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface Step1BasicsProps {
  formName: string
  setFormName: (name: string) => void
  formDescription: string
  setFormDescription: (desc: string) => void
  isActive: boolean
  setIsActive: (active: boolean) => void
  fields: FormFieldV2[]
  setFields: (fields: FormFieldV2[]) => void
  expandedFieldId: string | null
  setExpandedFieldId: (id: string | null) => void
  onAddField: () => void
  isEditMode: boolean
  formId?: string
  onSaveField: (fieldId: string, data: any) => void
  onDeleteField: (fieldId: string) => void
}

export function Step1Basics({
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  isActive,
  setIsActive,
  fields,
  setFields,
  expandedFieldId,
  setExpandedFieldId,
  onAddField,
  isEditMode,
  formId,
  onSaveField,
  onDeleteField,
}: Step1BasicsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)

      const newFields = arrayMove(fields, oldIndex, newIndex)
      setFields(newFields)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Form Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="form-name">Form Name</Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1.5 resize-none"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Form is accepting responses' : 'Form is not accepting responses'}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Form Fields</h2>
          <Button onClick={onAddField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="font-medium">No fields yet</p>
            <p className="text-sm mt-1">Click "Add Field" to get started</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field) => (
                  <SortableFieldEditor
                    key={field.id}
                    field={field}
                    isExpanded={expandedFieldId === field.id}
                    onToggleExpand={() =>
                      setExpandedFieldId(expandedFieldId === field.id ? null : field.id)
                    }
                    onSave={(data) => onSaveField(field.id, data)}
                    onDelete={() => onDeleteField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  )
}

// Sortable wrapper for FieldEditor
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableFieldEditorProps {
  field: FormFieldV2
  isExpanded: boolean
  onToggleExpand: () => void
  onSave: (data: any) => void
  onDelete: () => void
}

function SortableFieldEditor(props: SortableFieldEditorProps) {
  const { field } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <FieldEditor {...props} dragHandleProps={listeners} />
    </div>
  )
}
