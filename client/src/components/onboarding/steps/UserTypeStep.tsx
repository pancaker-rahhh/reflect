import React from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { User, Users } from 'lucide-react';

export const UserTypeStep: React.FC = () => {
  const { setUserType, nextStep } = useOnboarding();

  const handleSelection = (type: 'solo' | 'team') => {
    setUserType(type);
    nextStep();
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        How will you be using Reflect?
      </h2>
      <p className="text-gray-600 mb-8">
        This helps us personalize your experience
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => handleSelection('solo')}
          className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
              <User className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Solo Developer
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                I&rsquo;m working on personal projects or as an individual contributor
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Quick setup</li>
                <li>• Personal workspace</li>
                <li>• Simplified features</li>
              </ul>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelection('team')}
          className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
              <Users className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Team
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                I&rsquo;m working with others and need collaboration features
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Organization setup</li>
                <li>• Team management</li>
                <li>• Role-based access</li>
              </ul>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};