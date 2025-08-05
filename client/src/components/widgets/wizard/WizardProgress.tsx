import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted" />
      <div
        className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300"
        style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
      />
      <div className="relative flex justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background text-sm font-medium transition-all",
              index < currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : index === currentStep
                ? "border-primary text-primary"
                : "border-muted text-muted-foreground"
            )}
          >
            {index < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}