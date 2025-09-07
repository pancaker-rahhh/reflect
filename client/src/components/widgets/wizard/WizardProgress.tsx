import { ProgressWizard } from '@/components/ui/progress'

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => ({
    key: `step-${index}`,
    label: `Step ${index + 1}`,
  }))

  return <ProgressWizard steps={steps} currentStep={currentStep} />
}
