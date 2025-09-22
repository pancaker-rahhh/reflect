import React from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { useOnboardingKeyboard } from '../../../hooks/useOnboardingKeyboard'
import { ArrowLeft, Keyboard } from 'lucide-react'

export const StepNavigation: React.FC = () => {
  const { currentStep, previousStep, isLoading } = useOnboarding()

  // Determine if back button should be shown
  const canGoBack = currentStep !== 'profile'

  useOnboardingKeyboard({
    onPrevious: canGoBack ? previousStep : undefined,
    enabled: !isLoading,
  })

  // Always show navigation for simplified flow

  return (
    <div>
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <div>
          {canGoBack && (
            <button
              onClick={previousStep}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Alt + ← to go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {currentStep === 'profile' && 'Complete your profile details'}
          {currentStep === 'project' && 'Create your first project'}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Keyboard className="w-3 h-3" />
          <span>
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Tab</kbd> to
            navigate
          </span>
        </div>
        <span>
          • <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> to continue
        </span>
        {canGoBack && (
          <span>
            • <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Alt + ←</kbd> to go
            back
          </span>
        )}
      </div>
    </div>
  )
}
