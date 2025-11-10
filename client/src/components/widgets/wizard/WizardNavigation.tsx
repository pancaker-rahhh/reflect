import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting?: boolean
  submitButtonText?: string
  submittingText?: string
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isSubmitting,
  submitButtonText = 'Create Widget',
  submittingText = 'Creating...',
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button onClick={onNext} disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {submittingText}
          </>
        ) : isLastStep ? (
          submitButtonText
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
