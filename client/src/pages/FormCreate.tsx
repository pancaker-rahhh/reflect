import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { formApi } from '@/lib/api/form'
import { useAppContext } from '@/context/AppContext'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import ProgressBarComponent from '@/components/ui/ProgressBar'
import { WizardNavigation } from '@/components/widgets/wizard/WizardNavigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Step1Basics } from '@/components/forms/wizard/Step1Basics'
import { Step2Appearance } from '@/components/forms/wizard/Step2Appearance'
import { Step3GetCode } from '@/components/forms/wizard/Step3GetCode'
import { FormPreview } from '@/components/forms/preview/FormPreview'
import type { FormFieldV2, FormFieldCreate } from '@/types'

const steps = [
  { title: 'Functionality & Basics' },
  { title: 'Customize Appearance' },
  { title: 'Get Your Code' },
]

export function FormCreate() {
  const navigate = useNavigate()
  const { formId } = useParams<{ formId: string }>()
  const queryClient = useQueryClient()
  const toast = useToastNotifications()
  const { currentProject } = useAppContext()
  const isEditMode = !!formId
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isFormInitialMount = useRef(true)

  const [currentStep, setCurrentStep] = useState(0)
  const [formName, setFormName] = useState('Untitled Form')
  const [formDescription, setFormDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [fields, setFields] = useState<FormFieldV2[]>([])
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null)
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [appearance, setAppearance] = useState({
    theme: 'default',
    primaryColor: '#0066FF',
    headerGradientEnd: '',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    buttonTextColor: '#FFFFFF',
    pageBackground: 'none',
  })

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formApi.get(formId!),
    enabled: isEditMode && !!formId,
  })

  useEffect(() => {
    if (form) {
      setFormName(form.name)
      setFormDescription(form.description || '')
      setIsActive(form.is_active)
      setFields(form.fields || [])

      if (form.config && Object.keys(form.config).length > 0) {
        setAppearance({
          theme: form.config.theme || 'default',
          primaryColor: form.config.primaryColor || '#0066FF',
          headerGradientEnd: form.config.headerGradientEnd || '',
          backgroundColor: form.config.backgroundColor || '#FFFFFF',
          textColor: form.config.textColor || '#000000',
          buttonTextColor: form.config.buttonTextColor || '#FFFFFF',
          pageBackground: form.config.pageBackground || 'none',
        })
      }
      isFormInitialMount.current = true
    }
  }, [form])

  // Auto-navigate to step 2 after form creation
  useEffect(() => {
    const state = window.history.state?.usr
    if (state?.goToStep !== undefined && isEditMode) {
      setCurrentStep(state.goToStep)
      // Clear the state
      window.history.replaceState({}, '')
    }
  }, [isEditMode])

  // Debounced auto-save for form details and appearance
  useEffect(() => {
    if (!isEditMode || !formId || isFormInitialMount.current) {
      isFormInitialMount.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      updateMutation.mutate()
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [formName, formDescription, isActive, appearance, isEditMode, formId])

  const createMutation = useMutation({
    mutationFn: () => {
      const formData: any = {
        project_id: currentProject!.id,
        name: formName,
        description: formDescription || undefined,
        is_active: isActive,
        config: {
          theme: appearance.theme,
          primaryColor: appearance.primaryColor,
          headerGradientEnd: appearance.headerGradientEnd,
          backgroundColor: appearance.backgroundColor,
          textColor: appearance.textColor,
          buttonTextColor: appearance.buttonTextColor,
          pageBackground: appearance.pageBackground,
        },
        fields: fields.map((f, idx) => {
          const fieldData: any = {
            field_type: f.field_type,
            field_key: f.field_key,
            label: f.label,
            is_required: f.is_required,
            order_index: idx,
          }

          if (f.field_type === 'text') {
            fieldData.max_length = 1000
          } else if (f.field_type === 'number') {
            fieldData.min_value = 0
            fieldData.max_value = 10
          } else if (f.field_type === 'choice') {
            // Extract choices and multiple from config
            if (Array.isArray(f.config)) {
              // Config is array of {key, value} objects
              const choicesConfig = f.config.find((c: any) => c.key === 'choices')
              const multipleConfig = f.config.find((c: any) => c.key === 'multiple')
              fieldData.choices = choicesConfig?.value || []
              fieldData.multiple = multipleConfig?.value || false
            } else {
              fieldData.choices = []
              fieldData.multiple = false
            }
          }

          return fieldData
        }) as FormFieldCreate[],
      }
      return formApi.create(formData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms', currentProject?.id] })
      // Set the form data in cache immediately to avoid reset
      queryClient.setQueryData(['form', data.id], data)
      toast.showSuccess('Form created successfully!', 'Success')
      setIsSubmitting(false)
      // Navigate to edit mode and automatically go to step 3 (Get Your Code)
      navigate(`/app/forms/${data.id}/edit`, { replace: true, state: { goToStep: 2 } })
    },
    onError: (err) => {
      toast.showError((err as Error).message || 'Failed to create form', 'Error')
      setIsSubmitting(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      const updateData = {
        name: formName,
        description: formDescription || undefined,
        is_active: isActive,
        config: {
          theme: appearance.theme,
          primaryColor: appearance.primaryColor,
          headerGradientEnd: appearance.headerGradientEnd,
          backgroundColor: appearance.backgroundColor,
          textColor: appearance.textColor,
          buttonTextColor: appearance.buttonTextColor,
          pageBackground: appearance.pageBackground,
        },
      }
      return formApi.update(formId!, updateData)
    },
    onSuccess: (data) => {
      // Only invalidate the forms list, not the current form to avoid refetch loop
      queryClient.invalidateQueries({ queryKey: ['forms', currentProject?.id] })
      // Update the cache directly instead of invalidating
      queryClient.setQueryData(['form', formId], data)
    },
    onError: (err) => {
      toast.showError((err as Error).message || 'Failed to save form', 'Error')
    },
  })

  const addFieldMutation = useMutation({
    mutationFn: (field: FormFieldCreate) => formApi.addField(formId!, field),
    onSuccess: (newField) => {
      setFields([...fields, newField])
      setShowAddFieldModal(false)
      toast.showSuccess('Field added', 'Success')
      // Update cache directly to avoid refetch
      queryClient.setQueryData(['form', formId], (old: any) => ({
        ...old,
        fields: [...(old.fields || []), newField],
      }))
    },
    onError: (err) => {
      toast.showError((err as Error).message || 'Failed to add field', 'Error')
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: string; data: Partial<FormFieldCreate> }) =>
      formApi.updateField(formId!, fieldId, data),
    onSuccess: (updatedField) => {
      setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)))
      // Update cache directly to avoid refetch
      queryClient.setQueryData(['form', formId], (old: any) => ({
        ...old,
        fields: old.fields.map((f: any) => (f.id === updatedField.id ? updatedField : f)),
      }))
    },
    onError: (err) => {
      toast.showError((err as Error).message || 'Failed to update field', 'Error')
    },
  })

  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: string) => formApi.deleteField(formId!, fieldId),
    onSuccess: (_, fieldId) => {
      setFields(fields.filter((f) => f.id !== fieldId))
      toast.showSuccess('Field deleted', 'Success')
      // Update cache directly to avoid refetch
      queryClient.setQueryData(['form', formId], (old: any) => ({
        ...old,
        fields: old.fields.filter((f: any) => f.id !== fieldId),
      }))
    },
    onError: (err) => {
      toast.showError((err as Error).message || 'Failed to delete field', 'Error')
    },
  })

  const handleAddField = (fieldType: 'text' | 'number' | 'choice' | 'nps' | 'csat' | 'ces') => {
    if (fieldType === 'nps') {
      const ratingField: any = {
        id: `temp_${Date.now()}`,
        field_type: 'number',
        field_key: `nps_rating_${Date.now()}`,
        label: 'How likely are you to recommend us?',
        is_required: true,
        order_index: fields.length,
        min_value: 0,
        max_value: 10,
        config: [],
      }
      const commentField: any = {
        id: `temp_${Date.now() + 1}`,
        field_type: 'text',
        field_key: `nps_comment_${Date.now()}`,
        label: "What's the main reason for your score?",
        is_required: false,
        order_index: fields.length + 1,
        config: [],
      }

      if (isEditMode && formId) {
        addFieldMutation.mutate(ratingField)
        setTimeout(() => addFieldMutation.mutate(commentField), 100)
      } else {
        setFields([...fields, ratingField, commentField])
        setShowAddFieldModal(false)
      }
      return
    }

    if (fieldType === 'csat' || fieldType === 'ces') {
      const ratingField: any = {
        id: `temp_${Date.now()}`,
        field_type: 'number',
        field_key: `${fieldType}_rating_${Date.now()}`,
        label:
          fieldType === 'csat'
            ? 'How satisfied are you with our service?'
            : 'How easy was it to accomplish your goal?',
        is_required: true,
        order_index: fields.length,
        min_value: 1,
        max_value: 5,
        config: [],
      }
      const commentField: any = {
        id: `temp_${Date.now() + 1}`,
        field_type: 'text',
        field_key: `${fieldType}_comment_${Date.now()}`,
        label: 'Additional comments (optional)',
        is_required: false,
        order_index: fields.length + 1,
        config: [],
      }

      if (isEditMode && formId) {
        addFieldMutation.mutate(ratingField)
        setTimeout(() => addFieldMutation.mutate(commentField), 100)
      } else {
        setFields([...fields, ratingField, commentField])
        setShowAddFieldModal(false)
      }
      return
    }

    const fieldKey = `${fieldType}_${Date.now()}`
    const field: any = {
      id: `temp_${Date.now()}`,
      field_type: fieldType,
      field_key: fieldKey,
      label:
        fieldType === 'text'
          ? 'Your answer'
          : fieldType === 'number'
            ? 'Enter a number'
            : 'Select an option',
      is_required: false,
      order_index: fields.length,
      config:
        fieldType === 'choice'
          ? [
              { key: 'choices', value: ['Option 1', 'Option 2', 'Option 3'] },
              { key: 'multiple', value: false },
            ]
          : [],
    }

    if (isEditMode && formId) {
      addFieldMutation.mutate(field)
    } else {
      setFields([...fields, field])
      setShowAddFieldModal(false)
    }
  }

  const handleSaveField = (fieldId: string, data: any) => {
    if (isEditMode && formId && !fieldId.toString().startsWith('temp_')) {
      // For saved fields, call API
      updateFieldMutation.mutate({ fieldId, data })
    } else {
      // For temporary fields (before form creation), update local state
      setFields(
        fields.map((f) => {
          if (f.id === fieldId) {
            // Don't spread choices/multiple directly on the field
            const { choices, multiple, ...restData } = data
            const updatedField = { ...f, ...restData }

            // For choice fields, convert choices and multiple to config format
            if (f.field_type === 'choice') {
              updatedField.config = [
                {
                  key: 'choices',
                  value:
                    choices !== undefined
                      ? choices
                      : f.config?.find((c: any) => c.key === 'choices')?.value || [],
                },
                {
                  key: 'multiple',
                  value:
                    multiple !== undefined
                      ? multiple
                      : f.config?.find((c: any) => c.key === 'multiple')?.value || false,
                },
              ]
            }

            return updatedField
          }
          return f
        })
      )
    }
  }

  const handleDeleteField = (fieldId: string) => {
    if (isEditMode && formId && !fieldId.toString().startsWith('temp_')) {
      deleteFieldMutation.mutate(fieldId)
    } else {
      setFields(fields.filter((f) => f.id !== fieldId))
    }
  }

  const handleNext = () => {
    // If on step 2 (appearance) and not in edit mode, create the form
    if (currentStep === 1 && !isEditMode) {
      setIsSubmitting(true)
      createMutation.mutate()
      return
    }

    // If on last step, navigate back to forms list
    if (currentStep === steps.length - 1) {
      navigate('/app/forms')
      return
    }

    // Otherwise, move to next step
    setCurrentStep(currentStep + 1)
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isEditMode ? 'Edit Form' : 'Create Form'}
          </h1>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
        <PageLoading />
      </div>
    )
  }

  if (!currentProject) {
    return <div className="text-center p-8">Please select a project to continue.</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row max-h-[90vh]">
        <div
          className={`w-full ${currentStep < 2 ? 'lg:w-3/5' : ''} flex flex-col bg-card ${
            currentStep < 2 ? 'lg:border-r' : ''
          } border-border max-h-[90vh]`}
        >
          {currentStep < 2 && (
            <div className="p-4 lg:p-6 border-b border-border flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                {isEditMode ? 'Edit Your Form' : 'Create Your Form'}
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                {isEditMode
                  ? 'Update your form configuration'
                  : 'Configure your form in just a few steps'}{' '}
                for project: <strong>{currentProject.name}</strong>
              </p>
            </div>
          )}

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
            {currentStep < 2 && (
              <div className="w-full max-w-2xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-primary">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete (
                    {currentStep + 1}/{steps.length})
                  </span>
                </div>

                <ProgressBarComponent
                  percentage={((currentStep + 1) / steps.length) * 100}
                  variant="linear"
                  size="lg"
                  color="primary"
                  showLabel={false}
                  animated={true}
                  totalSteps={steps.length}
                  currentStep={currentStep}
                  showSteps={true}
                  stepLabels={steps.map((step) => step.title)}
                  showCompletion={false}
                  className="mb-6"
                />
              </div>
            )}
            {currentStep < 2 && (
              <div className="mt-6 lg:mt-8 mb-6 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                  {steps[currentStep].title}
                </h2>

                {currentStep === 0 && (
                  <Step1Basics
                    formName={formName}
                    setFormName={setFormName}
                    formDescription={formDescription}
                    setFormDescription={setFormDescription}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    fields={fields}
                    setFields={setFields}
                    expandedFieldId={expandedFieldId}
                    setExpandedFieldId={setExpandedFieldId}
                    onAddField={() => setShowAddFieldModal(true)}
                    isEditMode={isEditMode}
                    formId={formId}
                    onSaveField={handleSaveField}
                    onDeleteField={handleDeleteField}
                  />
                )}

                {currentStep === 1 && (
                  <Step2Appearance appearance={appearance} setAppearance={setAppearance} />
                )}
              </div>
            )}

            {currentStep === 2 && form && (
              <Step3GetCode publicLink={form.public_link} formName={formName} />
            )}
          </div>

          {currentStep < 2 && (
            <div className="p-4 lg:p-6 border-t border-border bg-card flex-shrink-0">
              <WizardNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isSubmitting={isSubmitting}
                submitButtonText={
                  currentStep === steps.length - 1
                    ? 'Done'
                    : isEditMode
                      ? 'Next'
                      : currentStep === 1
                        ? 'Create Form'
                        : 'Next'
                }
                submittingText="Creating form..."
              />
            </div>
          )}
        </div>

        {currentStep < 2 && (
          <div className="hidden lg:flex lg:w-2/5 flex-col">
            <div className="flex-1 sticky top-0 max-h-[90vh]">
              <FormPreview
                formName={formName}
                formDescription={formDescription}
                fields={fields}
                appearance={appearance}
              />
            </div>
          </div>
        )}

        {currentStep < 2 && (
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              onClick={() => {
                // Open mobile preview modal
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <AddFieldModal
        isOpen={showAddFieldModal}
        onClose={() => setShowAddFieldModal(false)}
        onAddField={handleAddField}
      />
    </div>
  )
}

function AddFieldModal({
  isOpen,
  onClose,
  onAddField,
}: {
  isOpen: boolean
  onClose: () => void
  onAddField: (type: 'text' | 'number' | 'choice' | 'nps' | 'csat' | 'ces') => void
}) {
  const fieldTypes = [
    { type: 'text' as const, label: 'Text', icon: '📝', description: 'Long form text response' },
    { type: 'number' as const, label: 'Number', icon: '🔢', description: 'Numeric input' },
    {
      type: 'choice' as const,
      label: 'Multiple Choice',
      icon: '☑️',
      description: 'Select from options',
    },
  ]

  const surveyTypes = [
    { type: 'nps' as const, label: 'NPS', icon: '📊', description: 'Net Promoter Score (0-10)' },
    {
      type: 'csat' as const,
      label: 'CSAT',
      icon: '⭐',
      description: 'Customer Satisfaction (1-5)',
    },
    { type: 'ces' as const, label: 'CES', icon: '🎯', description: 'Customer Effort Score (1-5)' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Basic Fields</h4>
            <div className="space-y-2">
              {fieldTypes.map((field) => (
                <button
                  key={field.type}
                  onClick={() => {
                    onAddField(field.type)
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <span className="text-2xl">{field.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{field.label}</p>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Survey Types</h4>
            <div className="space-y-2">
              {surveyTypes.map((survey) => (
                <button
                  key={survey.type}
                  onClick={() => {
                    onAddField(survey.type)
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <span className="text-2xl">{survey.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{survey.label}</p>
                    <p className="text-sm text-muted-foreground">{survey.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
