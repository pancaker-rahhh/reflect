import React from 'react';
import { OnboardingProvider } from '../context/OnboardingContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';

export const OnboardingPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
};