import React from 'react'
import { OnboardingProvider } from '../context/OnboardingContext'
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

export const OnboardingPage: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Onboarding error:', error, errorInfo)
        // Could send to error tracking service here
      }}
    >
      <OnboardingProvider>
        <OnboardingWizard />
      </OnboardingProvider>
    </ErrorBoundary>
  )
}
