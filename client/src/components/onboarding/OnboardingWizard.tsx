import React from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { KeyboardShortcutProvider } from '../../context/KeyboardShortcutContext'
import { ProfileStep } from './steps/ProfileStep'
import { ProjectStep } from './steps/ProjectStep'
import { ProgressBar } from './shared/ProgressBar'
import { StepNavigation } from './shared/StepNavigation'
import { usePreventNavigation } from '../../hooks/usePreventNavigation'
import '../../styles/onboarding.css'

export const OnboardingWizard: React.FC = () => {
  const { currentStep, isLoading, error } = useOnboarding()

  // Use the custom hook to prevent all navigation during onboarding
  usePreventNavigation(true)

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileStep />
      case 'project':
        return <ProjectStep />
      default:
        return null
    }
  }

  return (
    <KeyboardShortcutProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-10"></div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <br />
              {
                <div className="mt-6">
                  <ProgressBar />
                </div>
              }
            </div>

            <div className="glass-effect rounded-2xl shadow-2xl p-8 animate-fade-in">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 animate-slide-in">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                    <div className="absolute top-0 animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {renderStep()}
                  <StepNavigation />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </KeyboardShortcutProvider>
  )
}
