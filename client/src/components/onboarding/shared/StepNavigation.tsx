import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { ArrowLeft, SkipForward } from 'lucide-react';

export const StepNavigation: React.FC = () => {
  const { 
    currentStep, 
    previousStep, 
    skipOnboarding, 
    isLoading,
    userType,
  } = useOnboarding();

  const canGoBack = currentStep !== 'user-type';
  const showSkip = currentStep !== 'completion' && currentStep !== 'welcome';

  const getSteps = () => {
    const baseSteps = ['user-type', 'profile', 'organization', 'project'];
    if (userType === 'team') {
      baseSteps.push('team-setup');
    }
    return baseSteps;
  };

  const steps = getSteps();
  const isLastStep = currentStep === steps[steps.length - 1];

  if (currentStep === 'completion') {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
      <div>
        {canGoBack && (
          <button
            onClick={previousStep}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSkip && (
          <button
            onClick={skipOnboarding}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
            Skip Setup
          </button>
        )}

        <div className="text-sm text-gray-500">
          {currentStep === 'user-type' && 'Choose your account type'}
          {currentStep === 'profile' && 'Complete your profile details'}
          {currentStep === 'organization' && (userType === 'solo' ? 'Set up your workspace' : 'Create your organization')}
          {currentStep === 'project' && 'Create your first project'}
          {currentStep === 'team-setup' && 'Invite team members (optional)'}
        </div>
      </div>
    </div>
  );
};