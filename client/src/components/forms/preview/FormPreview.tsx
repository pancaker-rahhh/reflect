import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Star as StarIcon } from 'lucide-react'
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

  const getScoreColor = (score: number, isNPS: boolean = true) => {
    if (isNPS) {
      // NPS color coding
      if (score <= 3) return { bg: '#ef4444', border: '#f87171', light: '#fee2e2' }
      if (score <= 8) return { bg: '#f59e0b', border: '#fbbf24', light: '#fef3c7' }
      return { bg: '#10b981', border: '#34d399', light: '#d1fae5' }
    } else {
      // CSAT/CES color coding (1-5)
      const colors = [
        { bg: '#ef4444', border: '#f87171', light: '#fee2e2' }, // Red
        { bg: '#f97316', border: '#fb923c', light: '#ffedd5' }, // Orange
        { bg: '#eab308', border: '#facc15', light: '#fef9c3' }, // Yellow
        { bg: '#84cc16', border: '#a3e635', light: '#ecfccb' }, // Lime
        { bg: '#10b981', border: '#34d399', light: '#d1fae5' }, // Green
      ]
      return colors[score - 1] || colors[2]
    }
  }

  const getSatisfactionEmoji = (value: number) => {
    const emojis = ['😡', '😕', '😐', '😊', '😍']
    return emojis[value - 1] || ''
  }

  const getEaseEmoji = (value: number) => {
    const emojis = ['😤', '😔', '😐', '😌', '😊']
    return emojis[value - 1] || ''
  }

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
        <div className="text-xs text-muted-foreground mb-2 text-center">PREVIEW</div>
        <Card
          className="overflow-hidden shadow-lg"
          style={{ backgroundColor: appearance.backgroundColor }}
        >
          {/* Header */}
          <div className="p-8" style={headerStyle}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: appearance.buttonTextColor }}>
              {formName}
            </h1>
            {formDescription && (
              <p
                style={{
                  color: appearance.textColor || appearance.buttonTextColor,
                  opacity: 0.9,
                }}
              >
                {formDescription}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-8 space-y-6">
            {sortedFields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fields added yet</p>
                <p className="text-sm mt-2">Add fields to see them in the preview</p>
              </div>
            ) : (
              sortedFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    className="text-base font-medium"
                    style={{
                      color: appearance.textColor,
                    }}
                  >
                    {field.label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {field.field_type === 'text' && (
                    <Textarea
                      value={previewValues[field.field_key] || ''}
                      onChange={(e) =>
                        setPreviewValues({
                          ...previewValues,
                          [field.field_key]: e.target.value,
                        })
                      }
                      placeholder="Enter your response..."
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
                        <div className="space-y-3">
                          {previewValues[field.field_key] !== undefined && (
                            <div className="text-center">
                              <div
                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                                style={{
                                  backgroundColor: getScoreColor(
                                    previewValues[field.field_key],
                                    true
                                  ).light,
                                  color: getScoreColor(previewValues[field.field_key], true).bg,
                                }}
                              >
                                <span className="text-lg mr-1">
                                  {previewValues[field.field_key]}
                                </span>
                                <span className="text-xs opacity-75">/ 10</span>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-1.5">
                              {Array.from({ length: 6 }, (_, i) => {
                                const scoreColors = getScoreColor(i, true)
                                const isSelected = previewValues[field.field_key] === i
                                return (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      setPreviewValues({ ...previewValues, [field.field_key]: i })
                                    }
                                    className={cn(
                                      'flex-1 h-12 rounded-lg border-2 font-semibold transition-all',
                                      isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                                    )}
                                    style={{
                                      backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                                      borderColor: isSelected ? scoreColors.bg : '#d1d5db',
                                      color: isSelected ? '#ffffff' : appearance.textColor,
                                      boxShadow: isSelected
                                        ? `0 4px 12px ${scoreColors.bg}40`
                                        : undefined,
                                    }}
                                  >
                                    {i}
                                  </button>
                                )
                              })}
                            </div>
                            <div className="flex gap-1.5">
                              {Array.from({ length: 5 }, (_, i) => {
                                const score = i + 6
                                const scoreColors = getScoreColor(score, true)
                                const isSelected = previewValues[field.field_key] === score
                                return (
                                  <button
                                    key={score}
                                    onClick={() =>
                                      setPreviewValues({
                                        ...previewValues,
                                        [field.field_key]: score,
                                      })
                                    }
                                    className={cn(
                                      'flex-1 h-12 rounded-lg border-2 font-semibold transition-all',
                                      isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                                    )}
                                    style={{
                                      backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                                      borderColor: isSelected ? scoreColors.bg : '#d1d5db',
                                      color: isSelected ? '#ffffff' : appearance.textColor,
                                      boxShadow: isSelected
                                        ? `0 4px 12px ${scoreColors.bg}40`
                                        : undefined,
                                    }}
                                  >
                                    {score}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs px-1 text-gray-500">
                            <span>Not likely</span>
                            <span>Very likely</span>
                          </div>
                        </div>
                      ) : field.field_key.includes('review_rating') ||
                        (field.label.toLowerCase().includes('rate') &&
                          !field.label.toLowerCase().includes('satisfied') &&
                          !field.label.toLowerCase().includes('easy')) ? (
                        // Review field with star rating
                        <div className="space-y-4">
                          <div className="flex gap-1 justify-between">
                            {Array.from({ length: 5 }, (_, i) => {
                              const num = i + 1
                              const isSelected =
                                previewValues[field.field_key] !== undefined &&
                                Number(previewValues[field.field_key]) >= num
                              return (
                                <button
                                  key={num}
                                  onClick={() =>
                                    setPreviewValues({ ...previewValues, [field.field_key]: num })
                                  }
                                  className="flex-1 flex items-center justify-center p-2 transition-all hover:scale-110"
                                  style={{
                                    filter: isSelected ? `drop-shadow(0 0 8px #FCD34D)` : 'none',
                                  }}
                                >
                                  <StarIcon
                                    className={`w-10 h-10 transition-all duration-200 ${
                                      isSelected
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 hover:text-gray-400'
                                    }`}
                                  />
                                </button>
                              )
                            })}
                          </div>
                          {previewValues[field.field_key] !== undefined && (
                            <div className="text-center">
                              <div
                                className="text-sm font-medium"
                                style={{ color: appearance.textColor }}
                              >
                                {
                                  ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][
                                    previewValues[field.field_key]
                                  ]
                                }
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Rating: {previewValues[field.field_key]}/5
                              </div>
                            </div>
                          )}
                        </div>
                      ) : field.label.toLowerCase().includes('satisfied') ||
                        field.label.toLowerCase().includes('score') ? (
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            {Array.from({ length: 5 }, (_, i) => {
                              const num = i + 1
                              const scoreColors = getScoreColor(num, false)
                              const isSelected = previewValues[field.field_key] === num
                              const labels = ['Very Bad', 'Bad', 'OK', 'Good', 'Great']
                              return (
                                <button
                                  key={num}
                                  onClick={() =>
                                    setPreviewValues({ ...previewValues, [field.field_key]: num })
                                  }
                                  className={cn(
                                    'flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                                    isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                                  )}
                                  style={{
                                    backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                                    borderColor: isSelected ? scoreColors.bg : '#e5e7eb',
                                    color: isSelected ? '#ffffff' : appearance.textColor,
                                  }}
                                >
                                  <span className="text-3xl mb-2">{getSatisfactionEmoji(num)}</span>
                                  <span className="text-xs font-medium text-center leading-tight">
                                    {labels[i]}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                          {previewValues[field.field_key] !== undefined && (
                            <div className="text-center text-sm">
                              <div className="font-medium" style={{ color: appearance.textColor }}>
                                {
                                  ['Very Bad', 'Bad', 'OK', 'Good', 'Great'][
                                    previewValues[field.field_key] - 1
                                  ]
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                Score: {previewValues[field.field_key]}/5
                              </div>
                            </div>
                          )}
                        </div>
                      ) : field.label.toLowerCase().includes('easy') ? (
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            {Array.from({ length: 5 }, (_, i) => {
                              const num = i + 1
                              const scoreColors = getScoreColor(num, false)
                              const isSelected = previewValues[field.field_key] === num
                              const labels = ['Hard', 'Difficult', 'OK', 'Easy', 'Very Easy']
                              return (
                                <button
                                  key={num}
                                  onClick={() =>
                                    setPreviewValues({ ...previewValues, [field.field_key]: num })
                                  }
                                  className={cn(
                                    'flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                                    isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                                  )}
                                  style={{
                                    backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                                    borderColor: isSelected ? scoreColors.bg : '#e5e7eb',
                                    color: isSelected ? '#ffffff' : appearance.textColor,
                                  }}
                                >
                                  <span className="text-3xl mb-2">{getEaseEmoji(num)}</span>
                                  <span className="text-xs font-medium text-center leading-tight">
                                    {labels[i]}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                          {previewValues[field.field_key] !== undefined && (
                            <div className="text-center text-sm">
                              <div className="font-medium" style={{ color: appearance.textColor }}>
                                {
                                  ['Hard', 'Difficult', 'OK', 'Easy', 'Very Easy'][
                                    previewValues[field.field_key] - 1
                                  ]
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                Score: {previewValues[field.field_key]}/5
                              </div>
                            </div>
                          )}
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
                          const multipleConfig = field.config.find((c: any) => c.key === 'multiple')
                          return multipleConfig?.value || false
                        }
                        return false
                      }

                      const choices = getChoices()
                      const multiple = getMultiple()

                      if (multiple) {
                        // Render checkboxes for multiple selection
                        const selectedValues = Array.isArray(previewValues[field.field_key])
                          ? previewValues[field.field_key]
                          : []

                        return (
                          <div className="space-y-3">
                            {choices.map((choice: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`preview-${field.field_key}-${idx}`}
                                  checked={selectedValues.includes(choice)}
                                  onCheckedChange={(checked) => {
                                    const newValues = checked
                                      ? [...selectedValues, choice]
                                      : selectedValues.filter((v: string) => v !== choice)
                                    setPreviewValues({
                                      ...previewValues,
                                      [field.field_key]: newValues,
                                    })
                                  }}
                                />
                                <Label
                                  htmlFor={`preview-${field.field_key}-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                  style={{ color: appearance.textColor }}
                                >
                                  {choice}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )
                      } else {
                        // Render radio buttons for single selection
                        return (
                          <RadioGroup
                            value={previewValues[field.field_key] || ''}
                            onValueChange={(value) =>
                              setPreviewValues({
                                ...previewValues,
                                [field.field_key]: value,
                              })
                            }
                          >
                            {choices.map((choice: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={choice}
                                  id={`preview-${field.field_key}-${idx}`}
                                />
                                <Label
                                  htmlFor={`preview-${field.field_key}-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                  style={{ color: appearance.textColor }}
                                >
                                  {choice}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )
                      }
                    })()}
                </div>
              ))
            )}

            {sortedFields.length > 0 && (
              <Button
                className="w-full"
                style={{
                  backgroundColor: appearance.primaryColor,
                  color: appearance.buttonTextColor,
                }}
              >
                Submit
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
