import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Check } from 'lucide-react';

export const ProgressBar: React.FC = () => {
  const { currentStep, userType, completedSteps } = useOnboarding();

  const getSteps = () => {
    const baseSteps = [
      { key: 'user-type', label: 'Account Type' },
      { key: 'profile', label: 'Profile' },
      { key: 'organization', label: userType === 'solo' ? 'Workspace' : 'Organization' },
      { key: 'project', label: 'Project' },
    ];

    if (userType === 'team') {
      baseSteps.push({ key: 'team-setup', label: 'Team Setup' });
    }

    return baseSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const totalSteps = steps.length;
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-500">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.key as any);
            const isCurrent = step.key === currentStep;
            const isUpcoming = index > currentStepIndex;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isUpcoming
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="mt-2 text-xs text-center max-w-20 text-gray-600">
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={`h-1 rounded ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};