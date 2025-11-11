import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { FormFieldV2 } from '@/types'

export function getFieldLabel(fieldKey: string, fields: FormFieldV2[]): string {
  const field = fields.find((f) => f.field_key === fieldKey)
  return field?.label || fieldKey
}

export function renderFieldAnswer(
  fieldKey: string,
  answer: any,
  fields: FormFieldV2[]
): React.ReactNode {
  const field = fields.find((f) => f.field_key === fieldKey)

  if (!field) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{fieldKey}:</span>
        <span className="text-sm">{String(answer ?? 'N/A')}</span>
        <Badge variant="outline" className="text-xs">
          Field removed
        </Badge>
      </div>
    )
  }

  if (answer === null || answer === undefined || answer === '') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{field.label}:</span>
        <span className="text-sm text-muted-foreground italic">Not answered</span>
      </div>
    )
  }

  switch (field.field_type) {
    case 'text':
      return (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {String(answer)}
        </p>
      )
    case 'number':
      return (
        <Badge variant="outline" className="text-sm font-semibold px-3 py-1.5 bg-muted/50">
          {Number(answer).toLocaleString()}
        </Badge>
      )
    case 'choice':
      const choices = Array.isArray(answer) ? answer : [answer]
      return (
        <div className="flex flex-wrap gap-2">
          {choices.map((choice, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-sm font-medium px-3 py-1.5 bg-primary/10 text-primary border-primary/20"
            >
              {String(choice)}
            </Badge>
          ))}
        </div>
      )
    default:
      return <span className="text-sm text-foreground">{String(answer)}</span>
  }
}
