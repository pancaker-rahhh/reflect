import React from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { KeyboardShortcutProvider } from '../../context/KeyboardShortcutContext';
import { WelcomeStep } from './steps/WelcomeStep';
import { UserTypeStep } from './steps/UserTypeStep';
import { ProfileStep } from './steps/ProfileStep';
import { OrganizationStep } from './steps/OrganizationStep';
import { ProjectStep } from './steps/ProjectStep';
import { TeamSetupStep } from './steps/TeamSetupStep';
import { CompletionStep } from './steps/CompletionStep';
import { ProgressBar } from './shared/ProgressBar';
import { StepNavigation } from './shared/StepNavigation';

export const OnboardingWizard: React.FC = () => {
  const { currentStep, userType, isLoading, error } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'user-type':
        return <UserTypeStep />;
      case 'profile':
        return <ProfileStep />;
      case 'organization':
        return <OrganizationStep />;
      case 'project':
        return <ProjectStep />;
      case 'team-setup':
        return userType === 'team' ? <TeamSetupStep /> : null;
      case 'completion':
        return <CompletionStep />;
      default:
        return null;
    }
  };

  return (
    <KeyboardShortcutProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Welcome to Reflect
              </h1>
              {currentStep !== 'welcome' && currentStep !== 'completion' && (
                <ProgressBar />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {renderStep()}
                  {currentStep !== 'welcome' && <StepNavigation />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </KeyboardShortcutProvider>
  );
};