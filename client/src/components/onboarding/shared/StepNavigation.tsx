import React from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { Keyboard } from 'lucide-react'
 

export const StepNavigation: React.FC = () => {
  const { currentStep } = useOnboarding()

  return (
    <div className="pt-6 mt-6 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {currentStep === 'profile' && 'Complete your profile details'}
        {currentStep === 'project' && 'Create your first project'}
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
      </div>
    </div>
  )
}
