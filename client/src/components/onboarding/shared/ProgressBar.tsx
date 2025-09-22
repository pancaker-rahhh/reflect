import React from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { Sparkles } from 'lucide-react'
import ProgressBarComponent from '@/components/ui/ProgressBar'
import type { OnboardingStep } from '../../../context/OnboardingContext'
import { isFeatureEnabled } from '../../../lib/featureFlags'

// Progress Step 16: Integrate ProgressBar with onboarding flow
export const OnboardingProgressBar: React.FC = () => {
  const { currentStep, userType, completedSteps } = useOnboarding()
  const skipUserTypeSelection = isFeatureEnabled('SKIP_USER_TYPE_SELECTION')

  const getSteps = () => {
    const baseSteps = []

    // Welcome page is not counted as a step - it's just intro UX
    // Only include actual steps that require user action
    if (!skipUserTypeSelection) {
      baseSteps.push({ key: 'user-type', label: 'Account Type' })
    }

    baseSteps.push(
      { key: 'profile', label: 'Profile' },
      { key: 'organization', label: userType === 'solo' ? 'Workspace' : 'Organization' },
      { key: 'project', label: 'Project' }
    )

    if (userType === 'team') {
      baseSteps.push({ key: 'team-setup', label: 'Team Setup' })
    }

    return baseSteps
  }

  const steps = getSteps()
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep)
  const totalSteps = steps.length

  // Don't show progress bar on welcome page
  if (currentStep === 'welcome') {
    return null
  }

  // Only count completed steps that are actually visible to the user
  const completedStepsCount = steps.filter((step) =>
    completedSteps.has(step.key as OnboardingStep)
  ).length
  const progressPercentage = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0

  const stepLabels = steps.map(step => step.label)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Custom header with step information */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {Math.round(progressPercentage)}% Complete ({completedStepsCount}/{totalSteps})
        </span>
      </div>

      {/* Use the centralized ProgressBar component */}
      <ProgressBarComponent
        percentage={progressPercentage}
        variant="linear"
        size="lg"
        color="primary"
        showLabel={false} // We have custom header above
        animated={true}
        totalSteps={totalSteps}
        currentStep={currentStepIndex}
        showSteps={true}
        stepLabels={stepLabels}
        showCompletion={true}
        completionText="Onboarding Complete!"
        onComplete={() => console.log('Onboarding progress completed!')}
        onStepChange={(step: number) => console.log(`Onboarding step changed to: ${step}`)}
        className="mb-6"
      />
    </div>
  )
}

// Keep the old export for backward compatibility
export { OnboardingProgressBar as ProgressBar }