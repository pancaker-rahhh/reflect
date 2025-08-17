import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

export const CompletionStep: React.FC = () => {
  const { completeOnboarding, userType, isLoading } = useOnboarding();

  const nextSteps = [
    {
      title: 'Create your first widget',
      description: 'Add a feedback widget to start collecting user input',
      action: 'Get started',
    },
    {
      title: 'Explore the dashboard',
      description: 'View your project analytics and feedback trends',
      action: 'View dashboard',
    },
    {
      title: 'Read the documentation',
      description: 'Learn about advanced features and integrations',
      action: 'Open docs',
      external: true,
    },
  ];

  if (userType === 'team') {
    nextSteps.unshift({
      title: 'Invite more team members',
      description: 'Add colleagues to collaborate on your projects',
      action: 'Manage team',
    });
  }

  return (
    <div className="py-8 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          You&rsquo;re All Set! 🎉
        </h2>
        
        <p className="text-lg text-gray-600 mb-2">
          Welcome to Reflect! Your {userType === 'solo' ? 'workspace' : 'organization'} is ready.
        </p>
        
        <p className="text-gray-500">
          Here are some things you can do next:
        </p>
      </div>

      <div className="grid gap-4 mb-8 text-left">
        {nextSteps.map((step, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  {step.title}
                  {step.external && <ExternalLink className="w-4 h-4" />}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  {step.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo-800">
          <strong>Pro tip:</strong> Check out the help section in the sidebar for guides, 
          tutorials, and tips to get the most out of Reflect.
        </p>
      </div>

      <button
        onClick={completeOnboarding}
        disabled={isLoading}
        className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Finishing up...
          </>
        ) : (
          <>
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};