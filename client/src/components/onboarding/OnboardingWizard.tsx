import React from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { KeyboardShortcutProvider } from '../../context/KeyboardShortcutContext';
import { WelcomeStep } from './steps/WelcomeStep';
import { UserTypeStep } from './steps/UserTypeStep';
import { ProfileStep } from './steps/ProfileStep';
import { OrganizationStep } from './steps/OrganizationStep';
import { ProjectStep } from './steps/ProjectStep';
import { TeamSetupStep } from './steps/TeamSetupStep';
import { CompletionStepEnhanced } from './steps/CompletionStepEnhanced';
import { ProgressBar } from './shared/ProgressBar';
import { StepNavigation } from './shared/StepNavigation';
import { isFeatureEnabled } from '../../lib/featureFlags';
import '../../styles/onboarding.css';

export const OnboardingWizard: React.FC = () => {
  const { currentStep, userType, isLoading, error } = useOnboarding();
  const skipUserTypeSelection = isFeatureEnabled('SKIP_USER_TYPE_SELECTION');

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'user-type':
        // Skip user type step if feature flag is enabled
        return skipUserTypeSelection ? null : <UserTypeStep />;
      case 'profile':
        return <ProfileStep />;
      case 'organization':
        return <OrganizationStep />;
      case 'project':
        return <ProjectStep />;
      case 'team-setup':
        return userType === 'team' ? <TeamSetupStep /> : null;
      case 'completion':
        return <CompletionStepEnhanced />;
      default:
        return null;
    }
  };

  return (
    <KeyboardShortcutProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome to Reflect
              </h1>
              {currentStep !== 'welcome' && currentStep !== 'completion' && (
                <div className="mt-6">
                  <ProgressBar />
                </div>
              )}
            </div>

            <div className="glass-effect rounded-2xl shadow-2xl p-8 animate-fade-in">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 animate-slide-in">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                  {currentStep !== 'welcome' && <StepNavigation />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </KeyboardShortcutProvider>
  );
};