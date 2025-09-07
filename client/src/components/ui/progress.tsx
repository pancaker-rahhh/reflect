import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    showPercentage?: boolean
    label?: string
  }
>(({ className, value, showPercentage = false, label, ...props }, ref) => (
  <div className="w-full">
    {showPercentage && (
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <span className="font-medium">{label || 'Progress'}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">{Math.round(value || 0)}%</span>
          <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-muted/30 shadow-inner',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-700 ease-out relative"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

interface ProgressStepsProps {
  steps: Array<{
    key: string
    label: string
    completed?: boolean
  }>
  showLabels?: boolean
  className?: string
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(
  ({ steps, showLabels = true, className }, ref) => {
    const completedSteps = steps.filter((step) => step.completed).length
    const totalSteps = steps.length
    const progressPercentage = (completedSteps / totalSteps) * 100

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="font-medium">Setup Progress</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {completedSteps}/{totalSteps} completed
            </span>
            <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
          </div>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2.5 shadow-inner overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>
        {showLabels && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
              <div key={step.key} className="flex flex-col items-center group">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mb-2 transition-all duration-300 group-hover:scale-110',
                    step.completed
                      ? 'bg-primary shadow-md shadow-primary/30'
                      : 'bg-muted-foreground/30 border border-muted-foreground/20'
                  )}
                />
                <span
                  className={cn(
                    'text-center transition-colors duration-300 font-medium',
                    step.completed ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
ProgressSteps.displayName = 'ProgressSteps'

interface ProgressWizardProps {
  steps: Array<{
    key: string
    label: string
  }>
  currentStep: number
  className?: string
}

const ProgressWizard = React.forwardRef<HTMLDivElement, ProgressWizardProps>(
  ({ steps, currentStep, className }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted/50 rounded-full shadow-inner" />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div
                key={step.key}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background text-sm font-bold transition-all duration-300 group hover:scale-110',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/5 shadow-md'
                      : 'border-muted text-muted-foreground hover:border-muted-foreground/50'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 animate-in zoom-in-50 duration-300" />
                ) : (
                  <span className={cn('transition-all duration-300', isCurrent && 'animate-pulse')}>
                    {index + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ProgressWizard.displayName = 'ProgressWizard'

export { Progress, ProgressSteps, ProgressWizard }
