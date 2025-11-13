import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { formApi } from '@/lib/api/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2, Star as StarIcon } from 'lucide-react'
import type { FormFieldV2 } from '@/types'
import { getBackgroundStyle } from '@/lib/formBackgroundPatterns'

export function PublicFormView() {
  const { publicLink } = useParams<{ publicLink: string }>()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['publicForm', publicLink],
    queryFn: () => formApi.getByPublicLink(publicLink!),
    enabled: !!publicLink,
  })

  const submitMutation = useMutation({
    mutationFn: (data: { answers: Record<string, any> }) =>
      formApi.submitResponse(publicLink!, data),
    onSuccess: () => {
      setIsSubmitted(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields - check for null, undefined, empty string, or empty array
    const requiredFields = form?.fields?.filter((f) => f.is_required) || []
    const missingFields = requiredFields.filter((f) => {
      const answer = answers[f.field_key]
      return (
        answer === null ||
        answer === undefined ||
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0)
      )
    })

    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map((f) => f.label).join(', ')
      alert(`Please fill in all required fields: ${fieldLabels}`)
      return
    }

    submitMutation.mutate({ answers })
  }

  const handleAnswerChange = (fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const getChoicesFromConfig = (config: any): string[] => {
    if (Array.isArray(config)) {
      const choicesConfig = config.find((c: any) => c.key === 'choices')
      return choicesConfig?.value || []
    }
    return []
  }

  const getMultipleFromConfig = (config: any): boolean => {
    if (Array.isArray(config)) {
      const multipleConfig = config.find((c: any) => c.key === 'multiple')
      return multipleConfig?.value || false
    }
    return false
  }

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

  const renderField = (field: FormFieldV2) => {
    const value = answers[field.field_key] || ''

    switch (field.field_type) {
      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(field.field_key, e.target.value)}
            placeholder={field.label}
            required={field.is_required}
            className="min-h-[100px]"
          />
        )

      case 'number':
        // Check if this is an NPS rating (0-10)
        if (
          field.label.toLowerCase().includes('recommend') ||
          field.label.toLowerCase().includes('nps')
        ) {
          return (
            <div className="space-y-3">
              {value !== '' && (
                <div className="text-center">
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: getScoreColor(value, true).light,
                      color: getScoreColor(value, true).bg,
                    }}
                  >
                    <span className="text-lg mr-1">{value}</span>
                    <span className="text-xs opacity-75">/ 10</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const scoreColors = getScoreColor(i + 1, true)
                    const numValue =
                      value !== '' && value !== null && value !== undefined ? Number(value) : null
                    const isSelected = numValue === i + 1
                    return (
                      <button
                        key={i+1}
                        type="button"
                        onClick={() => handleAnswerChange(field.field_key, i+1)}
                        className={`flex-1 h-12 rounded-lg border-2 font-semibold transition-all ${
                          isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? scoreColors.bg
                            : form?.config?.backgroundColor || '#ffffff',
                          borderColor: isSelected ? scoreColors.bg : '#d1d5db',
                          color: isSelected ? '#ffffff' : form?.config?.textColor || '#374151',
                          boxShadow: isSelected ? `0 4px 12px ${scoreColors.bg}40` : undefined,
                        }}
                      >
                        {i+1}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const score = i + 6
                    const scoreColors = getScoreColor(score, true)
                    const numValue =
                      value !== '' && value !== null && value !== undefined ? Number(value) : null
                    const isSelected = numValue === score
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleAnswerChange(field.field_key, score)}
                        className={`flex-1 h-12 rounded-lg border-2 font-semibold transition-all ${
                          isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? scoreColors.bg
                            : form?.config?.backgroundColor || '#ffffff',
                          borderColor: isSelected ? scoreColors.bg : '#d1d5db',
                          color: isSelected ? '#ffffff' : form?.config?.textColor || '#374151',
                          boxShadow: isSelected ? `0 4px 12px ${scoreColors.bg}40` : undefined,
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
          )
        }

        // Check if this is a review rating (1-5) - MUST CHECK FIRST before CSAT
        if (
          field.field_key.includes('review_rating') ||
          (field.label.toLowerCase().includes('rate') &&
            field.label.toLowerCase().includes('experience')) ||
          (field.label.toLowerCase().includes('review') &&
            !field.label.toLowerCase().includes('satisfied') &&
            !field.label.toLowerCase().includes('easy'))
        ) {
          return (
            <div className="space-y-4">
              <div className="flex gap-1 justify-between">
                {Array.from({ length: 5 }, (_, i) => {
                  const num = i + 1
                  const isSelected = value !== '' && Number(value) >= num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAnswerChange(field.field_key, num)}
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
              {value !== '' && (
                <div className="text-center">
                  <div
                    className="text-sm font-medium"
                    style={{ color: form?.config?.textColor || '#1f2937' }}
                  >
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][Number(value)]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Rating: {value}/5</div>
                </div>
              )}
            </div>
          )
        }

        // Check if this is a satisfaction rating (1-5) - CSAT
        if (
          field.label.toLowerCase().includes('satisfied') ||
          (field.label.toLowerCase().includes('rate') &&
            !field.field_key.includes('review_rating') &&
            !field.label.toLowerCase().includes('experience')) ||
          field.label.toLowerCase().includes('score')
        ) {
          const labels = ['Very Bad', 'Bad', 'OK', 'Good', 'Great']
          return (
            <div className="space-y-4">
              <div className="flex gap-3">
                {Array.from({ length: 5 }, (_, i) => {
                  const num = i + 1
                  const scoreColors = getScoreColor(num, false)
                  const isSelected = value === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAnswerChange(field.field_key, num)}
                      className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                        borderColor: isSelected ? scoreColors.bg : '#e5e7eb',
                        color: isSelected ? '#ffffff' : form?.config?.textColor || '#374151',
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
              {value !== '' && (
                <div className="text-center text-sm">
                  <div
                    className="font-medium"
                    style={{ color: form?.config?.textColor || '#1f2937' }}
                  >
                    {labels[value - 1]}
                  </div>
                  <div className="text-xs text-gray-500">Score: {value}/5</div>
                </div>
              )}
            </div>
          )
        }

        // Check if this is an ease/effort rating (1-5) - CES
        if (field.label.toLowerCase().includes('easy')) {
          const labels = ['Hard', 'Difficult', 'OK', 'Easy', 'Very Easy']
          return (
            <div className="space-y-4">
              <div className="flex gap-3">
                {Array.from({ length: 5 }, (_, i) => {
                  const num = i + 1
                  const scoreColors = getScoreColor(num, false)
                  const isSelected = value === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAnswerChange(field.field_key, num)}
                      className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        isSelected ? 'shadow-lg scale-105' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isSelected ? scoreColors.bg : '#ffffff',
                        borderColor: isSelected ? scoreColors.bg : '#e5e7eb',
                        color: isSelected ? '#ffffff' : form?.config?.textColor || '#374151',
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
              {value !== '' && (
                <div className="text-center text-sm">
                  <div
                    className="font-medium"
                    style={{ color: form?.config?.textColor || '#1f2937' }}
                  >
                    {labels[value - 1]}
                  </div>
                  <div className="text-xs text-gray-500">Score: {value}/5</div>
                </div>
              )}
            </div>
          )
        }

        // Default number input for other cases
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(field.field_key, e.target.value)}
            placeholder={field.label}
            required={field.is_required}
          />
        )

      case 'choice':
        const choices = getChoicesFromConfig(field.config)
        const multiple = getMultipleFromConfig(field.config)

        if (field.field_key.includes('bug_severity')) {
          const severityOptions = [
            {
              value: 'low',
              label: 'Low',
              icon: '🟢',
              description: 'Minor issue, workaround available',
            },
            {
              value: 'medium',
              label: 'Medium',
              icon: '🟡',
              description: 'Noticeable issue affecting some users',
            },
            {
              value: 'high',
              label: 'High',
              icon: '🟠',
              description: 'Major issue affecting many users',
            },
            {
              value: 'critical',
              label: 'Critical',
              icon: '🔴',
              description: 'Blocking issue, needs immediate attention',
            },
          ]

          return (
            <div className="space-y-2">
              {severityOptions.map((option) => {
                const isSelected = value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswerChange(field.field_key, option.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected ? 'border-2' : 'border hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: isSelected ? form?.config?.primaryColor || '#0066FF' : '#E5E7EB',
                      backgroundColor: isSelected
                        ? `${form?.config?.primaryColor || '#0066FF'}10`
                        : form?.config?.backgroundColor || '#ffffff',
                      color: form?.config?.textColor || '#374151',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        }

        if (field.field_key.includes('feature_priority')) {
          const priorityOptions = [
            {
              value: 'low',
              label: 'Nice to Have',
              icon: '😌',
              description: 'Would be helpful but not essential',
            },
            {
              value: 'medium',
              label: 'Important',
              icon: '😊',
              description: 'Would significantly improve experience',
            },
            {
              value: 'high',
              label: 'Critical',
              icon: '🚀',
              description: 'Essential for workflow/success',
            },
          ]

          return (
            <div className="space-y-2">
              {priorityOptions.map((option) => {
                const isSelected = value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswerChange(field.field_key, option.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected ? 'border-2' : 'border hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: isSelected ? form?.config?.primaryColor || '#0066FF' : '#E5E7EB',
                      backgroundColor: isSelected
                        ? `${form?.config?.primaryColor || '#0066FF'}10`
                        : form?.config?.backgroundColor || '#ffffff',
                      color: form?.config?.textColor || '#374151',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        }

        if (multiple) {
          const selectedValues = Array.isArray(value) ? value : []

          return (
            <div className="space-y-3">
              {choices.map((choice, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.field_key}-${idx}`}
                    checked={selectedValues.includes(choice)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, choice]
                        : selectedValues.filter((v) => v !== choice)
                      handleAnswerChange(field.field_key, newValues)
                    }}
                  />
                  <Label
                    htmlFor={`${field.field_key}-${idx}`}
                    className="text-sm font-normal cursor-pointer"
                    style={{ color: form?.config?.textColor || '#374151' }}
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <RadioGroup
              value={value}
              onValueChange={(val) => handleAnswerChange(field.field_key, val)}
            >
              {choices.map((choice, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={choice} id={`${field.field_key}-${idx}`} />
                  <Label
                    htmlFor={`${field.field_key}-${idx}`}
                    className="text-sm font-normal cursor-pointer"
                    style={{ color: form?.config?.textColor || '#374151' }}
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )
        }

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground">
            The form you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    )
  }

  if (!form.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Form Inactive</h1>
          <p className="text-muted-foreground">This form is currently not accepting responses.</p>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground">Your response has been submitted successfully.</p>
        </Card>
      </div>
    )
  }

  // Apply appearance config
  const config = form.config || {}
  const headerStyle: React.CSSProperties = config.headerGradientEnd
    ? {
        background: `linear-gradient(135deg, ${config.primaryColor || '#0066FF'} 0%, ${
          config.headerGradientEnd
        } 100%)`,
        color: config.buttonTextColor || '#FFFFFF',
      }
    : {
        backgroundColor: config.primaryColor || '#0066FF',
        color: config.buttonTextColor || '#FFFFFF',
      }

  const pageBackgroundStyle = getBackgroundStyle(config.pageBackground)

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: '#f9fafb',
        ...pageBackgroundStyle,
      }}
    >
      <Card
        className="max-w-2xl mx-auto overflow-hidden shadow-lg"
        style={{ backgroundColor: config.backgroundColor || '#FFFFFF' }}
      >
        {/* Header */}
        <div className="p-8" style={headerStyle}>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: config.buttonTextColor || '#FFFFFF' }}
          >
            {form.name}
          </h1>
          {form.description && (
            <p
              style={{
                color: config.textColor || config.buttonTextColor || '#FFFFFF',
                opacity: 0.9,
              }}
            >
              {form.description}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {form.fields?.map((field) => (
            <div key={field.id}>
              <Label
                className="text-base font-medium mb-2 block"
                style={{ color: config.textColor || '#1f2937' }}
              >
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full"
            style={{
              backgroundColor: config.primaryColor || '#0066FF',
              color: config.buttonTextColor || '#FFFFFF',
            }}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
