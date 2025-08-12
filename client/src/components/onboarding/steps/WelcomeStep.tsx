import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { ArrowRight, Sparkles, Users, ChartBar } from 'lucide-react';

export const WelcomeStep: React.FC = () => {
  const { nextStep, skipOnboarding } = useOnboarding();

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-indigo-600" />
        </div>
        
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Reflect!
        </h2>
        
        <p className="text-xl text-gray-600 mb-8">
          Let's get you set up in just a few minutes
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-50 rounded-lg p-6">
          <Users className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">Collaborate</h3>
          <p className="text-sm text-gray-600">
            Work together with your team to build better products
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <ChartBar className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">Analyze</h3>
          <p className="text-sm text-gray-600">
            Get insights from user feedback and data
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <Sparkles className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">Improve</h3>
          <p className="text-sm text-gray-600">
            Make data-driven decisions to enhance your product
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={nextStep}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={skipOnboarding}
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
        >
          Skip setup (I'll explore on my own)
        </button>
      </div>
    </div>
  );
};