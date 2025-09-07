import React from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { Sparkles } from 'lucide-react'
import { ProgressWizard } from '@/components/ui/progress'
import type { OnboardingStep } from '../../../context/OnboardingContext'

export const ProgressBar: React.FC = () => {
  const { currentStep, userType, completedSteps } = useOnboarding()

  const getSteps = () => {
    const baseSteps = [
      { key: 'user-type', label: 'Account Type' },
      { key: 'profile', label: 'Profile' },
      { key: 'organization', label: userType === 'solo' ? 'Workspace' : 'Organization' },
      { key: 'project', label: 'Project' },
    ]

    if (userType === 'team') {
      baseSteps.push({ key: 'team-setup', label: 'Team Setup' })
    }

    return baseSteps
  }

  const steps = getSteps()
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep)
  const totalSteps = steps.length

  // Calculate progress based on completed steps, not current step
  const completedStepsCount = steps.filter((step) =>
    completedSteps.has(step.key as OnboardingStep)
  ).length
  const progressPercentage = (completedStepsCount / totalSteps) * 100

  const progressSteps = steps.map((step, _index) => ({
    key: step.key,
    label: step.label,
    completed: completedSteps.has(step.key as OnboardingStep),
  }))

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {Math.round(progressPercentage)}% Complete ({completedStepsCount}/{totalSteps})
        </span>
      </div>

      <ProgressWizard steps={progressSteps} currentStep={currentStepIndex} className="mb-6" />

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  )
}
