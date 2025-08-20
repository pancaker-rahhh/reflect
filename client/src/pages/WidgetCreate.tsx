import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardProgress } from '@/components/widgets/wizard/WizardProgress'
import { WizardNavigation } from '@/components/widgets/wizard/WizardNavigation'
import { Step1Basics } from '@/components/widgets/wizard/Step1Basics'
import { Step2Content } from '@/components/widgets/wizard/Step2Content'
import { Step3Appearance } from '@/components/widgets/wizard/Step3Appearance'
import { Step4Behavior } from '@/components/widgets/wizard/Step4Behavior'
import { widgetApi } from '@/lib/api/widget'
import { useAppContext } from '@/context/AppContext'
import { PageLoading } from '@/components/common/LoadingSpinner'

const widgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  modules: z.object({
    feedback: z.boolean(),
    reviews: z.boolean(),
    bugReporting: z.boolean(),
    featureRequests: z.boolean(),
  }),
  primaryType: z.enum([
    'FEEDBACK',
    'SURVEY',
    'REVIEW',
    'BUG_REPORT',
    'FEATURE_REQUEST',
    'NPS',
    'CSAT',
    'CES',
  ]),
  content: z.object({
    headerTitle: z.string().min(1, 'Header title is required'),
    mainQuestion: z.string().min(1, 'Main question is required'),
    submitButtonText: z.string().min(1, 'Button text is required'),
    thankYouTitle: z.string().min(1, 'Thank you title is required'),
    thankYouMessage: z.string().min(1, 'Thank you message is required'),
    // Scoring fields for NPS, CSAT, CES
    npsScore: z.number().min(0).max(10).optional(),
    csatScore: z.number().min(1).max(5).optional(),
    cesScore: z.number().min(1).max(5).optional(),
  }),
  appearance: z.object({
    theme: z.enum(['default', 'midnight', 'minimal-light', 'minimal-dark']),
    position: z.enum(['bottom_right', 'bottom_left', 'top_right', 'top_left', 'center']),
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

export type WidgetFormData = z.infer<typeof widgetSchema>

const steps = [
  { title: 'Functionality & Basics', component: Step1Basics },
  { title: 'Configure Content', component: Step2Content },
  { title: 'Customize Appearance', component: Step3Appearance },
  { title: 'Behavior & Targeting', component: Step4Behavior },
]

export function WidgetCreate() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentProject, isLoading } = useAppContext()

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: '',
      modules: { feedback: true, reviews: false, bugReporting: false, featureRequests: false },
      primaryType: 'FEEDBACK',
      content: {
        headerTitle: 'We value your feedback',
        mainQuestion: 'How can we improve?',
        submitButtonText: 'Submit Feedback',
        thankYouTitle: 'Thank you!',
        thankYouMessage: 'Your feedback helps us improve.',
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

  const handleSubmit = async () => {
    if (!currentProject) {
      alert('No project is selected. Please select a project first.')
      return
    }
    const data = form.getValues()
    setIsSubmitting(true)
    try {
      const newWidget = await widgetApi.create(currentProject.id, data)
      navigate(`/widgets/${newWidget.id}/get-code`)
    } catch (error) {
      console.error('Failed to create widget:', error)
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

  if (!currentProject) {
    return <div className="text-center p-8">Please select a project to continue.</div>
  }

  const StepComponent = steps[currentStep].component

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Widget</h1>
        <p className="text-muted-foreground">
          Configure your feedback widget in just a few steps for project:{' '}
          <strong>{currentProject.name}</strong>
        </p>
      </div>
      <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">{steps[currentStep].title}</h2>
        <StepComponent form={form} />
      </div>
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
