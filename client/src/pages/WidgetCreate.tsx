import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { WizardProgress } from '@/components/widgets/wizard/WizardProgress'
import { WizardNavigation } from '@/components/widgets/wizard/WizardNavigation'
import { Step1Basics } from '@/components/widgets/wizard/Step1Basics'
import { Step2Content } from '@/components/widgets/wizard/Step2Content'
import { Step3Appearance } from '@/components/widgets/wizard/Step3Appearance'
import { Step4Behavior } from '@/components/widgets/wizard/Step4Behavior'
import { LiveWidgetPreview } from '@/components/widgets/preview/LiveWidgetPreview'
import { widgetApi } from '@/lib/api/widget'
import { useAppContext } from '@/context/AppContext'
import { PageLoading } from '@/components/common/LoadingSpinner'

// Production-grade widget schema supporting all widget types
const widgetSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Widget name is required')
      .max(255, 'Widget name must be 255 characters or less'),
    modules: z
      .object({
        feedback: z.boolean(),
        reviews: z.boolean(),
        bugReporting: z.boolean(),
        featureRequests: z.boolean(),
      })
      .refine(
        (modules) => {
          return Object.values(modules).some(Boolean)
        },
        { message: 'At least one module must be enabled' }
      ),

    primaryType: z.enum([
      'FEEDBACK',
      'SURVEY',
      'NPS',
      'CSAT',
      'CES',
      'REVIEW',
      'BUG_REPORT',
      'FEATURE_REQUEST',
    ]),

    content: z.object({
      headerTitle: z.string().min(1, 'Header title is required'),
      mainQuestion: z.string().min(1, 'Main question is required'),
      submitButtonText: z.string().min(1, 'Button text is required'),
      thankYouTitle: z.string().min(1, 'Thank you title is required'),
      thankYouMessage: z.string().min(1, 'Thank you message is required'),
      npsScore: z.number().min(0).max(10).optional(),
      csatScore: z.number().min(1).max(5).optional(),
      cesScore: z.number().min(1).max(5).optional(),
      reviewPrompt: z.string().optional(),
      requireReviewText: z.boolean().optional(),
      bugCategories: z.array(z.string()).optional(),
      bugSeverityLevels: z.array(z.string()).optional(),
      requireStepsToReproduce: z.boolean().optional(),
      featureCategories: z.array(z.string()).optional(),
      priorityLevels: z.array(z.string()).optional(),
      requireUseCase: z.boolean().optional(),
    }),

    appearance: z.object({
      theme: z.enum(['default', 'midnight', 'minimal-light', 'minimal-dark']),
      position: z.enum(['bottom_right', 'bottom_left', 'mid_right', 'mid_left']),
      colors: z.object({
        primary: z.string(),
        headerGradientEnd: z.string().optional(),
        background: z.string(),
        text: z.string(),
        buttonColor: z.string(),
        buttonTextColor: z.string(),
      }),
      showBranding: z.boolean(),
    }),

    behavior: z.object({
      triggerType: z.enum(['immediate', 'delay', 'exit-intent', 'scroll']),
      triggerDelay: z.number().optional(),
      urlTargeting: z.object({
        includeUrls: z.array(z.string()),
        excludeUrls: z.array(z.string()),
      }),
      deviceTypes: z.object({
        desktop: z.boolean(),
        mobile: z.boolean(),
        tablet: z.boolean(),
      }),
    }),
  })
  .refine(
    (data) => {
      // Ensure primaryType matches the enabled module
      if (data.modules.feedback) {
        const validFeedbackTypes = ['FEEDBACK', 'NPS', 'CSAT', 'CES', 'SURVEY']
        return validFeedbackTypes.includes(data.primaryType)
      }

      if (data.modules.reviews) {
        return data.primaryType === 'REVIEW'
      }

      if (data.modules.bugReporting) {
        return data.primaryType === 'BUG_REPORT'
      }

      if (data.modules.featureRequests) {
        return data.primaryType === 'FEATURE_REQUEST'
      }

      return false
    },
    {
      message: 'Primary type must match the enabled module type',
      path: ['primaryType'],
    }
  )

export type WidgetFormData = z.infer<typeof widgetSchema>

interface TriggerDetails {
  type: string
  delay?: number
}

interface UrlTargetingDetails {
  includeUrls: string[]
  excludeUrls: string[]
}

interface DeviceTargetingDetails {
  desktop: boolean
  mobile: boolean
  tablet: boolean
}

const steps = [
  { title: 'Functionality & Basics', component: Step1Basics },
  { title: 'Configure Content', component: Step2Content },
  { title: 'Customize Appearance', component: Step3Appearance },
  { title: 'Behavior & Targeting', component: Step4Behavior },
]

export function WidgetCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { widgetId } = useParams<{ widgetId: string }>()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingWidget, setIsLoadingWidget] = useState(false)
  const [widgetDataLoaded, setWidgetDataLoaded] = useState(false)
  const { currentProject, isLoading } = useAppContext()

  const isEditMode = !!widgetId

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: isEditMode
      ? undefined
      : {
          name: '',
          modules: { feedback: true, reviews: false, bugReporting: false, featureRequests: false },
          primaryType: 'FEEDBACK',
          content: {
            headerTitle: 'We value your feedback',
            mainQuestion: 'How can we improve?',
            submitButtonText: 'Submit Feedback',
            thankYouTitle: 'Thank you!',
            thankYouMessage: 'Your feedback helps us improve.',
            reviewPrompt: 'Share your thoughts about your experience',
            requireReviewText: false,
            requireStepsToReproduce: false,
            requireUseCase: true,
          },
          appearance: {
            theme: 'default',
            position: 'bottom_right',
            colors: {
              primary: '#6B46C1',
              background: '#FFFFFF',
              text: '#1F2937',
              buttonColor: '#6B46C1',
              buttonTextColor: '#FFFFFF',
            },
            showBranding: true,
          },
          behavior: {
            triggerType: 'immediate',
            urlTargeting: { includeUrls: [], excludeUrls: [] },
            deviceTypes: { desktop: true, mobile: true, tablet: true },
          },
        },
  })

  // Auto-set primaryType when modules change to ensure validation consistency
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('modules.')) {
        const modules = value.modules
        if (modules) {
          let newPrimaryType: WidgetFormData['primaryType'] | undefined

          if (modules.feedback) {
            newPrimaryType = 'FEEDBACK'
          } else if (modules.reviews) {
            newPrimaryType = 'REVIEW'
          } else if (modules.bugReporting) {
            newPrimaryType = 'BUG_REPORT'
          } else if (modules.featureRequests) {
            newPrimaryType = 'FEATURE_REQUEST'
          }

          if (newPrimaryType && newPrimaryType !== value.primaryType) {
            form.setValue('primaryType', newPrimaryType)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  // Load widget data for edit mode
  useEffect(() => {
    if (isEditMode && widgetId && currentProject) {
      setIsLoadingWidget(true)
      widgetApi
        .getWidget(widgetId)
        .then((widget) => {
          const formData: WidgetFormData = {
            name: widget.name,
            modules: {
              feedback: widget.configuration?.modules?.feedback ?? true,
              reviews: widget.configuration?.modules?.reviews ?? false,
              bugReporting: widget.configuration?.modules?.bugReporting ?? false,
              featureRequests: widget.configuration?.modules?.featureRequests ?? false,
            },
            primaryType: (() => {
              // Map backend widget types to frontend primaryType
              const typeMapping: Record<string, WidgetFormData['primaryType']> = {
                FEEDBACK: 'FEEDBACK',
                SURVEY: 'SURVEY',
                NPS: 'NPS',
                CSAT: 'CSAT',
                CES: 'CES',
                REVIEW: 'REVIEW',
                BUG_REPORT: 'BUG_REPORT',
                FEATURE_REQUEST: 'FEATURE_REQUEST',
              }
              return typeMapping[widget.widget_type] || 'FEEDBACK'
            })(),
            content: {
              headerTitle: widget.configuration?.content?.headerTitle || 'We value your feedback',
              mainQuestion: widget.configuration?.content?.mainQuestion || 'How can we improve?',
              submitButtonText:
                widget.configuration?.content?.submitButtonText || 'Submit Feedback',
              thankYouTitle: widget.configuration?.content?.thankYouTitle || 'Thank you!',
              thankYouMessage:
                widget.configuration?.content?.thankYouMessage || 'Your feedback helps us improve.',
              reviewPrompt:
                widget.configuration?.typeSpecificSettings?.reviewPrompt ||
                widget.configuration?.content?.reviewPrompt ||
                'Share your thoughts about your experience',
              requireReviewText:
                widget.configuration?.typeSpecificSettings?.requireReviewText ||
                widget.configuration?.content?.requireReviewText ||
                false,
              requireStepsToReproduce:
                widget.configuration?.typeSpecificSettings?.requireStepsToReproduce ||
                widget.configuration?.content?.requireStepsToReproduce ||
                false,
              requireUseCase:
                widget.configuration?.typeSpecificSettings?.requireUseCase ||
                widget.configuration?.content?.requireUseCase ||
                true,
            },
            appearance: {
              theme: widget.theme_configuration?.theme_name || 'default',
              position: (() => {
                // Map old position values to new ones
                const positionMapping: Record<
                  string,
                  'bottom_right' | 'bottom_left' | 'mid_right' | 'mid_left'
                > = {
                  bottom_right: 'bottom_right',
                  bottom_left: 'bottom_left',
                  top_right: 'mid_right', // Map old top_right to new mid_right
                  top_left: 'mid_left', // Map old top_left to new mid_left
                  center: 'bottom_right', // Map old center to bottom_right as fallback
                }
                return positionMapping[widget.position] || 'bottom_right'
              })(),
              colors: {
                primary: widget.theme_configuration?.primary || '#6B46C1',
                background: widget.theme_configuration?.background || '#FFFFFF',
                text: widget.theme_configuration?.text || '#1F2937',
                buttonColor: widget.theme_configuration?.buttonColor || '#6B46C1',
                buttonTextColor: widget.theme_configuration?.buttonTextColor || '#FFFFFF',
              },
              showBranding: widget.theme_configuration?.show_branding ?? true,
            },
            behavior: {
              triggerType: (['immediate', 'delay', 'exit-intent', 'scroll'].includes(
                (widget.targeting_rules?.[0]?.details as TriggerDetails)?.type
              )
                ? (widget.targeting_rules?.[0]?.details as TriggerDetails)?.type
                : 'immediate') as 'immediate' | 'delay' | 'exit-intent' | 'scroll',
              triggerDelay: (widget.targeting_rules?.[0]?.details as TriggerDetails)?.delay,
              urlTargeting: {
                includeUrls:
                  (widget.targeting_rules?.[1]?.details as UrlTargetingDetails)?.includeUrls || [],
                excludeUrls:
                  (widget.targeting_rules?.[1]?.details as UrlTargetingDetails)?.excludeUrls || [],
              },
              deviceTypes: (widget.targeting_rules?.[2]?.details as DeviceTargetingDetails) || {
                desktop: true,
                mobile: true,
                tablet: true,
              },
            },
          }
          form.reset(formData)
          setWidgetDataLoaded(true)
        })
        .catch((error) => {
          console.error('Failed to load widget:', error)
          alert('Failed to load widget data')
        })
        .finally(() => {
          setIsLoadingWidget(false)
        })
    }
  }, [isEditMode, widgetId, currentProject, form])

  const handleSubmit = async () => {
    if (!currentProject) {
      alert('No project is selected. Please select a project first.')
      return
    }
    const data = form.getValues()
    setIsSubmitting(true)
    try {
      if (isEditMode && widgetId) {
        await widgetApi.update(widgetId, data)
        queryClient.invalidateQueries({ queryKey: ['widget', widgetId] })
        navigate(`/widgets/${widgetId}/get-code`)
      } else {
        const newWidget = await widgetApi.create(currentProject.id, data)
        queryClient.invalidateQueries({ queryKey: ['widgets', currentProject.id] })
        navigate(`/widgets/${newWidget.id}/get-code`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} widget:`, error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (isEditMode && isLoadingWidget) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Widget</h1>
          <p className="text-muted-foreground">Loading widget data...</p>
        </div>
        <PageLoading />
      </div>
    )
  }

  if (!currentProject) {
    return <div className="text-center p-8">Please select a project to continue.</div>
  }

  const StepComponent = steps[currentStep].component

  if (isEditMode && !widgetDataLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Widget</h1>
          <p className="text-muted-foreground">Loading widget data...</p>
        </div>
        <PageLoading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row max-h-[90vh]">
        <div className="w-full lg:w-3/5 flex flex-col bg-white lg:border-r max-h-[90vh]">
          <div className="p-4 lg:p-6 border-b flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
              {isEditMode ? 'Edit Your Widget' : 'Create Your Widget'}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {isEditMode
                ? 'Update your feedback widget configuration'
                : 'Configure your feedback widget in just a few steps'}{' '}
              for project: <strong>{currentProject.name}</strong>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
            <div className="mt-6 lg:mt-8 mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                {steps[currentStep].title}
              </h2>
              <StepComponent form={form} />
            </div>
          </div>

          <div className="p-4 lg:p-6 border-t bg-gray-50 flex-shrink-0">
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        <div className="hidden lg:flex lg:w-2/5 flex-col">
          <div className="flex-1 sticky top-0 max-h-[90vh]">
            <LiveWidgetPreview form={form} />
          </div>
        </div>

        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              // TODO: Open mobile preview modal
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
      </div>
    </div>
  )
}
