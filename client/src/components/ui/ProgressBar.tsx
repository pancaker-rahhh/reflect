import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, Loader2 } from 'lucide-react'

// Progress Step 1: TypeScript interfaces for all props
export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  percentage: number
  /** Visual variant of the progress bar */
  variant?: 'linear' | 'circular'
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg'
  /** Color theme for the progress bar */
  color?: 'primary' | 'success' | 'warning' | 'error'
  /** Whether to show the percentage label */
  showLabel?: boolean
  /** Custom label text */
  label?: string
  /** Custom aria-label for accessibility */
  ariaLabel?: string
  /** Whether the progress bar is animated */
  animated?: boolean
  /** Custom className for styling */
  className?: string
  /** Number of steps for multi-step processes */
  totalSteps?: number
  /** Current step for multi-step processes */
  currentStep?: number
  /** Whether to show step indicators */
  showSteps?: boolean
  /** Custom step labels */
  stepLabels?: string[]
  /** Whether the progress bar is in loading state */
  loading?: boolean
  /** Custom loading text */
  loadingText?: string
  /** Whether to show completion checkmark */
  showCompletion?: boolean
  /** Custom completion text */
  completionText?: string
  /** Callback when progress reaches 100% */
  onComplete?: () => void
  /** Callback when step changes */
  onStepChange?: (step: number) => void
}

// Progress Step 2: Error boundary component for invalid percentage values
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ProgressBarErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProgressBar Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="w-4 h-4" />
          <span>Progress bar error: {this.state.error?.message}</span>
        </div>
      )
    }

    return this.props.children
  }
}

// Progress Step 3: Main ProgressBar component with core functionality
const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  variant = 'linear',
  size = 'md',
  color = 'primary',
  showLabel = true,
  label,
  ariaLabel,
  animated = true,
  className,
  totalSteps,
  currentStep,
  showSteps = false,
  stepLabels,
  loading = false,
  loadingText = 'Loading...',
  showCompletion = true,
  completionText = 'Complete',
  onComplete,
  onStepChange,
}) => {
  // Progress Step 4: State management and validation
  const [displayPercentage, setDisplayPercentage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [prevPercentage, setPrevPercentage] = useState(0)

  // Validate percentage value
  const validatedPercentage = Math.max(0, Math.min(100, percentage || 0))
  const isInvalid = percentage < 0 || percentage > 100 || isNaN(percentage)

  // Progress Step 5: Smooth animation transitions between progress states
  useEffect(() => {
    if (isInvalid) return

    const targetPercentage = validatedPercentage
    const startPercentage = prevPercentage
    const duration = 500 // Animation duration in ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentPercentage = startPercentage + (targetPercentage - startPercentage) * easeOutCubic
      
      setDisplayPercentage(currentPercentage)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayPercentage(targetPercentage)
        setPrevPercentage(targetPercentage)
        
        // Check for completion
        if (targetPercentage >= 100 && !isComplete) {
          setIsComplete(true)
          onComplete?.()
        } else if (targetPercentage < 100 && isComplete) {
          setIsComplete(false)
        }
      }
    }

    if (animated) {
      requestAnimationFrame(animate)
    } else {
      setDisplayPercentage(targetPercentage)
      setPrevPercentage(targetPercentage)
    }
  }, [validatedPercentage, animated, isComplete, onComplete, prevPercentage, isInvalid])

  // Progress Step 6: Step control functionality for multi-step processes
  const handleStepChange = useCallback((newStep: number) => {
    if (totalSteps && newStep >= 0 && newStep <= totalSteps) {
      onStepChange?.(newStep)
    }
  }, [totalSteps, onStepChange])

  // Calculate step-based percentage if steps are provided
  const stepPercentage = totalSteps && currentStep !== undefined 
    ? (currentStep / totalSteps) * 100 
    : displayPercentage

  const finalPercentage = totalSteps && currentStep !== undefined ? stepPercentage : displayPercentage

  // Progress Step 7: CSS variables for theming and size configurations
  const sizeConfig = {
    sm: {
      height: 'h-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      stepSize: 'w-2 h-2',
      padding: 'p-2',
    },
    md: {
      height: 'h-2.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
      stepSize: 'w-3 h-3',
      padding: 'p-3',
    },
    lg: {
      height: 'h-4',
      text: 'text-base',
      icon: 'w-5 h-5',
      stepSize: 'w-4 h-4',
      padding: 'p-4',
    },
  }

  const colorConfig = {
    primary: {
      bg: 'bg-primary',
      text: 'text-primary',
      border: 'border-primary',
      gradient: 'from-primary via-primary/90 to-primary/80',
      step: 'bg-primary',
      stepCompleted: 'bg-primary shadow-primary/30',
    },
    success: {
      bg: 'bg-success',
      text: 'text-success',
      border: 'border-success',
      gradient: 'from-success via-success/90 to-success/80',
      step: 'bg-success',
      stepCompleted: 'bg-success shadow-success/30',
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-warning',
      border: 'border-warning',
      gradient: 'from-warning via-warning/90 to-warning/80',
      step: 'bg-warning',
      stepCompleted: 'bg-warning shadow-warning/30',
    },
    error: {
      bg: 'bg-destructive',
      text: 'text-destructive',
      border: 'border-destructive',
      gradient: 'from-destructive via-destructive/90 to-destructive/80',
      step: 'bg-destructive',
      stepCompleted: 'bg-destructive shadow-destructive/30',
    },
  }

  const config = sizeConfig[size]
  const colors = colorConfig[color]

  // Progress Step 8: Accessibility features
  const accessibilityProps = {
    role: 'progressbar',
    'aria-valuenow': Math.round(finalPercentage),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-label': ariaLabel || label || `Progress: ${Math.round(finalPercentage)}%`,
  }

  // Progress Step 9: Render error state
  if (isInvalid) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
        <AlertCircle className="w-4 h-4" />
        <span>Invalid percentage value: {percentage}</span>
      </div>
    )
  }

  // Progress Step 10: Render loading state
  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn('font-medium text-muted-foreground', config.text)}>
            {loadingText}
          </span>
          <Loader2 className={cn('animate-spin', colors.text, config.icon)} />
        </div>
        <div className={cn('w-full bg-muted/30 rounded-full overflow-hidden', config.height)}>
          <div className={cn('h-full bg-gradient-to-r animate-pulse', colors.gradient)} />
        </div>
      </div>
    )
  }

  // Progress Step 11: Render completion state
  if (isComplete && showCompletion) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn('font-medium', colors.text, config.text)}>
            {completionText}
          </span>
          <Check className={cn(colors.text, config.icon)} />
        </div>
        <div className={cn('w-full bg-muted/30 rounded-full overflow-hidden', config.height)}>
          <div className={cn('h-full bg-gradient-to-r', colors.gradient)} />
        </div>
      </div>
    )
  }

  // Progress Step 12: Render linear progress bar
  if (variant === 'linear') {
    return (
      <div className={cn('w-full', className)}>
        {/* Label and percentage display */}
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className={cn('font-medium text-muted-foreground', config.text)}>
              {label || 'Progress'}
            </span>
            <span className={cn('font-semibold', colors.text, config.text)}>
              {Math.round(finalPercentage)}%
            </span>
          </div>
        )}

        {/* Step indicators */}
        {showSteps && totalSteps && currentStep !== undefined && (
          <div className="flex justify-between mb-3">
            {Array.from({ length: totalSteps }, (_, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const stepLabel = stepLabels?.[index] || `Step ${index + 1}`

              return (
                <div key={index} className="flex flex-col items-center group">
                  <button
                    onClick={() => handleStepChange(index)}
                    className={cn(
                      'rounded-full transition-all duration-300 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center',
                      config.stepSize,
                      isCompleted
                        ? cn('shadow-md', colors.stepCompleted)
                        : isCurrent
                          ? cn('border-2', colors.border, 'bg-background')
                          : 'bg-muted-foreground/30 border border-muted-foreground/20'
                    )}
                    aria-label={`${stepLabel} - ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}`}
                  >
                    {isCompleted && <Check className={cn(colors.text, config.icon)} />}
                  </button>
                  <span
                    className={cn(
                      'text-center transition-colors duration-300 font-medium mt-1',
                      config.text,
                      isCompleted ? colors.text : 'text-muted-foreground'
                    )}
                  >
                    {stepLabel}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress bar */}
        <div
          {...accessibilityProps}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-muted/30 shadow-inner',
            config.height
          )}
        >
          <div
            className={cn(
              'h-full flex-1 bg-gradient-to-r transition-all duration-700 ease-out relative',
              colors.gradient
            )}
            style={{ width: `${finalPercentage}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-tertiary/20 animate-shimmer" />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Progress Step 13: Render circular progress bar
  if (variant === 'circular') {
    const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 6
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (finalPercentage / 100) * circumference

    return (
      <div className={cn('flex flex-col items-center', className)}>
        {/* Circular progress SVG */}
        <div className="relative">
          <svg
            width={radius * 2 + strokeWidth}
            height={radius * 2 + strokeWidth}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn('transition-all duration-700 ease-out', colors.text)}
              style={{
                strokeDasharray,
                strokeDashoffset,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isComplete && showCompletion ? (
              <Check className={cn(colors.text, config.icon)} />
            ) : (
              <span className={cn('font-semibold', colors.text, config.text)}>
                {Math.round(finalPercentage)}%
              </span>
            )}
          </div>
        </div>

        {/* Label */}
        {showLabel && (
          <span className={cn('mt-2 font-medium text-muted-foreground', config.text)}>
            {label || 'Progress'}
          </span>
        )}
      </div>
    )
  }

  return null
}

// Progress Step 14: Export with error boundary wrapper
const ProgressBarWithErrorBoundary: React.FC<ProgressBarProps> = (props) => (
  <ProgressBarErrorBoundary>
    <ProgressBar {...props} />
  </ProgressBarErrorBoundary>
)

export default ProgressBarWithErrorBoundary
