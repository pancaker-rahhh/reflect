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
import { api } from '@/services/api'
import type { Widget } from '@/types'

const widgetSchema = z.object({
  // Step 1
  name: z.string().min(1, 'Widget name is required'),
  modules: z.object({
    feedback: z.boolean(),
    reviews: z.boolean(),
    bugReporting: z.boolean(),
    featureRequests: z.boolean(),
  }),
  primaryType: z.enum(['nps', 'csat', 'ces', 'custom']),
  
  // Step 2
  content: z.object({
    headerTitle: z.string().min(1, 'Header title is required'),
    mainQuestion: z.string().min(1, 'Main question is required'),
    submitButtonText: z.string().min(1, 'Button text is required'),
    thankYouTitle: z.string().min(1, 'Thank you title is required'),
    thankYouMessage: z.string().min(1, 'Thank you message is required'),
  }),
  
  // Step 3
  appearance: z.object({
    theme: z.enum(['default', 'midnight', 'minimal-light', 'minimal-dark']),
    position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center']),
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
  
  // Step 4
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

type WidgetFormData = z.infer<typeof widgetSchema>

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

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: '',
      modules: {
        feedback: true,
        reviews: false,
        bugReporting: false,
        featureRequests: false,
      },
      primaryType: 'nps',
      content: {
        headerTitle: 'We value your feedback',
        mainQuestion: 'How likely are you to recommend our product to a friend or colleague?',
        submitButtonText: 'Submit Feedback',
        thankYouTitle: 'Thank you!',
        thankYouMessage: 'Your feedback helps us improve.',
      },
      appearance: {
        theme: 'default',
        position: 'bottom-right',
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
        urlTargeting: {
          includeUrls: [],
          excludeUrls: [],
        },
        deviceTypes: {
          desktop: true,
          mobile: true,
          tablet: true,
        },
      },
    },
  })

  const StepComponent = steps[currentStep].component

  const handleNext = async () => {
    // Validate current step fields
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

  const handleSubmit = async () => {
    const data = form.getValues()
    setIsSubmitting(true)
    
    try {
      const widgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        projectId: 'project-1', // In a real app, this would come from context
        isActive: true,
      }
      
      await api.createWidget(widgetData)
      navigate('/widgets')
    } catch (error) {
      console.error('Failed to create widget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Widget</h1>
        <p className="text-muted-foreground">
          Configure your feedback widget in just a few steps
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