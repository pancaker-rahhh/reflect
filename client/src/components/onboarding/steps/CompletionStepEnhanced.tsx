import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useOnboardingKeyboard } from '../../../hooks/useOnboardingKeyboard';
import { onboardingDataService } from '../../../services/onboardingDataService';
import type { LucideIcon } from 'lucide-react';
import { 
  CheckCircle, 
  ArrowRight, 
  User, 
  FolderOpen,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OnboardingData {
  profile: {
    name?: string;
    role?: string;
    company?: string;
  };
  organization: {
    name?: string;
    type?: string;
  };
  project: {
    name?: string;
    description?: string;
  };
  team: {
    memberCount?: number;
    invitesSent?: number;
    members?: Array<{ email: string; role: string }>;
  };
}

export const CompletionStepEnhanced: React.FC = () => {
  const { 
    completeOnboarding, 
    userType, 
    isLoading
  } = useOnboarding();
  const [isReviewing, setIsReviewing] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {},
    organization: {},
    project: {},
    team: {}
  });

  useOnboardingKeyboard({
    onNext: !isReviewing ? completeOnboarding : undefined,
    enabled: !isLoading
  });

  useEffect(() => {
    // Load saved onboarding data from localStorage or API
    loadOnboardingData();
  }, []);

  const loadOnboardingData = () => {
    const allData = onboardingDataService.getAllData();
    
    const savedData = {
      profile: {
        name: allData.profile?.name || 'Not provided',
        role: allData.profile?.role || 'Not specified',
        company: allData.profile?.company || 'Not specified'
      },
      organization: {},
      project: {
        name: allData.project?.name || 'Project not created',
        description: allData.project?.description || 'No description provided'
      },
      team: {
        memberCount: allData.team?.members?.length || 0,
        invitesSent: allData.team?.invitesSent || 0,
        members: allData.team?.members || []
      }
    };
    setOnboardingData(savedData);
  };

  // Editing is disabled on the summary page

  const handleConfirm = async () => {
    setIsReviewing(false);
    await completeOnboarding();
  };

  const sections: Array<{
    id: string;
    title: string;
    icon: LucideIcon;
    step: 'profile' | 'project';
    fields: Array<{ label: string; value: string | undefined }>;
  }> = [
    {
      id: 'profile',
      title: 'Your Profile',
      icon: User,
      step: 'profile' as const,
      fields: [
        { label: 'Name', value: onboardingData.profile.name },
        { label: 'Role', value: onboardingData.profile.role },
        { label: 'Company', value: onboardingData.profile.company }
      ]
    },
    {
      id: 'project',
      title: 'Your Project',
      icon: FolderOpen,
      step: 'project' as const,
      fields: [
        { label: 'Name', value: onboardingData.project.name },
        { label: 'Description', value: onboardingData.project.description }
      ]
    }
  ];

  if (isReviewing) {
    return (
      <div className="py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mb-6 shadow-xl">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Review Your Setup
          </h2>
          
          <p className="text-lg text-gray-600">
            Let&rsquo;s make sure everything looks good before we finish
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div 
                key={section.id}
                className="bg-tertiary border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                      <div className="space-y-2">
                        {section.fields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 min-w-[100px]">{field.label}:</span>
                            <span className="font-medium text-gray-800">{field.value || 'Not set'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Everything look good?</h4>
              <p className="text-sm text-gray-600">
                You can always change these settings later from your dashboard. Click the edit buttons above to make changes now, or continue to finish setup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 button-hover-lift"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Finishing up...
              </>
            ) : (
              <>
                Looks Good, Let&rsquo;s Go!
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Success state after confirmation
  return (
    <div className="py-8 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-6 shadow-2xl animate-pulse-once">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          You&rsquo;re All Set! 🎉
        </h2>
        
        <p className="text-xl text-gray-600 mb-2">
          Welcome to Reflect! Your {userType === 'solo' ? 'workspace' : 'organization'} is ready.
        </p>
        
        <p className="text-gray-500">
          Redirecting you to your dashboard...
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { 
            title: 'Create your first widget', 
            description: 'Start collecting user feedback',
            icon: '🎯'
          },
          { 
            title: 'Explore the dashboard', 
            description: 'View analytics and insights',
            icon: '📊'
          },
          { 
            title: 'Invite your team', 
            description: 'Collaborate with colleagues',
            icon: '👥'
          }
        ].map((item, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all card-hover-grow"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <ChevronRight className="w-4 h-4 text-indigo-600 mt-3" />
          </div>
        ))}
      </div>

      <button
        onClick={completeOnboarding}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Loading dashboard...
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