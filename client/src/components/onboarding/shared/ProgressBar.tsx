import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Check, Sparkles } from 'lucide-react';

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
        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-500" />
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
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg scale-110'
                        : isCurrent
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg animate-pulse-once scale-110'
                        : isUpcoming
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center max-w-20 font-medium transition-colors duration-300 ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 mb-6">
                    <div className="h-1 bg-gray-200 rounded-full relative overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                          index < currentStepIndex 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full' 
                            : index === currentStepIndex
                            ? 'bg-gradient-to-r from-indigo-400 to-purple-500 w-1/2'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};