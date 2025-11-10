import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import type { FormFieldV2 } from '@/types'
import { cn } from '@/lib/utils'
import { getBackgroundStyle } from '@/lib/formBackgroundPatterns'

interface FormPreviewProps {
  formName: string
  formDescription: string
  fields: FormFieldV2[]
  appearance: {
    theme: string
    primaryColor: string
    headerGradientEnd: string
    backgroundColor: string
    textColor: string
    buttonTextColor: string
    pageBackground?: string
  }
}

export function FormPreview({ formName, formDescription, fields, appearance }: FormPreviewProps) {
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({})

  const sortedFields = [...fields].sort((a, b) => a.order_index - b.order_index)

  const headerStyle = appearance.headerGradientEnd
    ? {
        background: `linear-gradient(135deg, ${appearance.primaryColor} 0%, ${appearance.headerGradientEnd} 100%)`,
      }
    : {
        background: `linear-gradient(135deg, ${appearance.primaryColor} 0%, ${appearance.primaryColor}dd 100%)`,
      }

  const pageBackgroundStyle = getBackgroundStyle(appearance.pageBackground)

  return (
    <div
      className="h-full p-6 overflow-auto"
      style={{
        backgroundColor: '#f9fafb',
        ...pageBackgroundStyle,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Preview
          </h3>
        </div>

        <Card
          className="shadow-lg overflow-hidden"
          style={{ backgroundColor: appearance.backgroundColor }}
        >
          <div className="p-6 text-center" style={headerStyle}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: appearance.buttonTextColor }}>
              {formName || 'Untitled Form'}
            </h1>
            {formDescription && (
              <p style={{ color: appearance.buttonTextColor, opacity: 0.9 }}>{formDescription}</p>
            )}
          </div>

          <div className="p-8" style={{ color: appearance.textColor }}>
            <div className="space-y-6">
              {sortedFields.length === 0 ? (
                <div
                  className="text-center py-12 border-2 border-dashed rounded-lg"
                  style={{
                    borderColor: appearance.primaryColor + '40',
                    color: appearance.textColor + '80',
                  }}
                >
                  <p>No fields added yet</p>
                  <p className="text-sm mt-2">Add fields to see them here</p>
                </div>
              ) : (
                sortedFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label
                      className="text-base font-medium"
                      style={{ color: appearance.textColor }}
                    >
                      {field.label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {field.field_type === 'text' && (
                      <Textarea
                        value={previewValues[field.field_key] || ''}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.field_key]: e.target.value })
                        }
                        placeholder="Enter your response..."
                        className="resize-none"
                        style={{
                          borderColor: previewValues[field.field_key]
                            ? appearance.primaryColor
                            : undefined,
                          backgroundColor: appearance.backgroundColor,
                          color: appearance.textColor,
                        }}
                      />
                    )}

                    {field.field_type === 'number' && (
                      <div className="space-y-4">
                        {field.label.toLowerCase().includes('recommend') ||
                        field.label.toLowerCase().includes('nps') ? (
                          <div className="flex gap-2">
                            {Array.from({ length: 11 }, (_, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  setPreviewValues({ ...previewValues, [field.field_key]: i })
                                }
                                className={cn(
                                  'flex-1 h-12 rounded-lg border-2 font-semibold transition-all',
                                  previewValues[field.field_key] === i
                                    ? 'border-primary shadow-md scale-105'
                                    : 'border-border hover:border-primary/50'
                                )}
                                style={{
                                  borderColor:
                                    previewValues[field.field_key] === i
                                      ? appearance.primaryColor
                                      : undefined,
                                  backgroundColor:
                                    previewValues[field.field_key] === i
                                      ? appearance.primaryColor + '10'
                                      : undefined,
                                  color: appearance.textColor,
                                }}
                              >
                                {i}
                              </button>
                            ))}
                          </div>
                        ) : field.label.toLowerCase().includes('satisfied') ||
                          field.label.toLowerCase().includes('easy') ||
                          field.label.toLowerCase().includes('csat') ||
                          field.label.toLowerCase().includes('ces') ? (
                          <div className="flex gap-2">
                            {Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => (
                              <button
                                key={rating}
                                onClick={() =>
                                  setPreviewValues({ ...previewValues, [field.field_key]: rating })
                                }
                                className={cn(
                                  'flex-1 h-16 rounded-lg border-2 font-semibold transition-all',
                                  previewValues[field.field_key] === rating
                                    ? 'border-primary shadow-md scale-105'
                                    : 'border-border hover:border-primary/50'
                                )}
                                style={{
                                  borderColor:
                                    previewValues[field.field_key] === rating
                                      ? appearance.primaryColor
                                      : undefined,
                                  backgroundColor:
                                    previewValues[field.field_key] === rating
                                      ? appearance.primaryColor + '10'
                                      : undefined,
                                  color: appearance.textColor,
                                }}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <Input
                            type="number"
                            value={previewValues[field.field_key] || ''}
                            onChange={(e) =>
                              setPreviewValues({
                                ...previewValues,
                                [field.field_key]: e.target.value,
                              })
                            }
                            style={{
                              borderColor: previewValues[field.field_key]
                                ? appearance.primaryColor
                                : undefined,
                              backgroundColor: appearance.backgroundColor,
                              color: appearance.textColor,
                            }}
                          />
                        )}
                      </div>
                    )}

                    {field.field_type === 'choice' &&
                      (() => {
                        // Extract choices and multiple flag from config
                        const getChoices = () => {
                          if (Array.isArray(field.config)) {
                            // Config is array of {key, value} objects
                            const choicesConfig = field.config.find((c: any) => c.key === 'choices')
                            return choicesConfig?.value || []
                          }
                          return []
                        }

                        const getMultiple = () => {
                          if (Array.isArray(field.config)) {
                            const multipleConfig = field.config.find(
                              (c: any) => c.key === 'multiple'
                            )
                            return multipleConfig?.value || false
                          }
                          return false
                        }

                        const choices = getChoices()
                        const multiple = getMultiple()

                        if (multiple) {
                          // Render checkboxes for multiple selection
                          const selectedValues = (previewValues[field.field_key] as string[]) || []

                          return (
                            <div className="space-y-3">
                              {choices.map((choice: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                                >
                                  <Checkbox
                                    id={`${field.id}-${idx}`}
                                    checked={selectedValues.includes(choice)}
                                    onCheckedChange={(checked) => {
                                      const newValues = checked
                                        ? [...selectedValues, choice]
                                        : selectedValues.filter((v) => v !== choice)
                                      setPreviewValues({
                                        ...previewValues,
                                        [field.field_key]: newValues,
                                      })
                                    }}
                                    style={{ borderColor: appearance.primaryColor }}
                                  />
                                  <Label
                                    htmlFor={`${field.id}-${idx}`}
                                    className="flex-1 cursor-pointer font-normal"
                                    style={{ color: appearance.textColor }}
                                  >
                                    {choice}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )
                        }

                        // Render radio buttons for single selection
                        return (
                          <RadioGroup
                            value={previewValues[field.field_key]}
                            onValueChange={(value) =>
                              setPreviewValues({ ...previewValues, [field.field_key]: value })
                            }
                          >
                            <div className="space-y-3">
                              {choices.map((choice: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                                >
                                  <RadioGroupItem
                                    value={choice}
                                    id={`${field.id}-${idx}`}
                                    style={{ color: appearance.primaryColor }}
                                  />
                                  <Label
                                    htmlFor={`${field.id}-${idx}`}
                                    className="flex-1 cursor-pointer font-normal"
                                    style={{ color: appearance.textColor }}
                                  >
                                    {choice}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        )
                      })()}
                  </div>
                ))
              )}
            </div>

            {sortedFields.length > 0 && (
              <div
                className="mt-8 pt-6 border-t"
                style={{ borderColor: appearance.primaryColor + '20' }}
              >
                <Button
                  className="w-full"
                  size="lg"
                  style={{
                    backgroundColor: appearance.primaryColor,
                    color: appearance.buttonTextColor,
                  }}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
