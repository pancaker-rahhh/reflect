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
import { CheckCircle, Loader2 } from 'lucide-react'
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

    // Validate required fields
    const requiredFields = form?.fields?.filter((f) => f.is_required) || []
    const missingFields = requiredFields.filter((f) => !answers[f.field_key])

    if (missingFields.length > 0) {
      alert('Please fill in all required fields')
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

        if (multiple) {
          // Multi-select with checkboxes
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
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          )
        } else {
          // Single-select with radio buttons
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
                style={{ color: config.textColor || '#000000' }}
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
