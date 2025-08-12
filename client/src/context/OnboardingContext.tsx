import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export type UserType = 'solo' | 'team';

export type OnboardingStep = 
  | 'welcome'
  | 'user-type'
  | 'profile'
  | 'organization'
  | 'project'
  | 'team-setup'
  | 'completion';

interface OnboardingState {
  currentStep: OnboardingStep;
  userType: UserType | null;
  completedSteps: Set<OnboardingStep>;
  organizationId: string | null;
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface OnboardingContextType extends OnboardingState {
  setUserType: (type: UserType) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  markStepCompleted: (step: OnboardingStep) => void;
  setOrganizationId: (id: string) => void;
  setProjectId: (id: string) => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  isStepAccessible: (step: OnboardingStep) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'reflect_onboarding_state';

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'user-type',
  'profile',
  'organization',
  'project',
  'team-setup',
  'completion',
];

const SOLO_STEPS: OnboardingStep[] = [
  'welcome',
  'user-type',
  'profile',
  'organization',
  'project',
  'completion',
];

const TEAM_STEPS: OnboardingStep[] = [
  'welcome',
  'user-type',
  'profile',
  'organization',
  'project',
  'team-setup',
  'completion',
];

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [state, setState] = useState<OnboardingState>(() => {
    const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          ...parsed,
          completedSteps: new Set(parsed.completedSteps || []),
        };
      } catch (error) {
        console.error('Failed to parse saved onboarding state:', error);
      }
    }
    
    return {
      currentStep: 'welcome',
      userType: null,
      completedSteps: new Set(),
      organizationId: null,
      projectId: null,
      isLoading: false,
      error: null,
    };
  });

  useEffect(() => {
    const stateToSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state]);

  const getRelevantSteps = (): OnboardingStep[] => {
    if (!state.userType) return STEP_ORDER;
    return state.userType === 'solo' ? SOLO_STEPS : TEAM_STEPS;
  };

  const setUserType = (type: UserType) => {
    setState(prev => ({
      ...prev,
      userType: type,
      completedSteps: new Set([...prev.completedSteps, 'user-type']),
    }));
  };

  const nextStep = () => {
    const steps = getRelevantSteps();
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
      }));
    }
  };

  const previousStep = () => {
    const steps = getRelevantSteps();
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStep: steps[currentIndex - 1],
      }));
    }
  };

  const goToStep = (step: OnboardingStep) => {
    if (isStepAccessible(step)) {
      setState(prev => ({
        ...prev,
        currentStep: step,
      }));
    }
  };

  const markStepCompleted = (step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, step]),
    }));
  };

  const setOrganizationId = (id: string) => {
    setState(prev => ({
      ...prev,
      organizationId: id,
    }));
  };

  const setProjectId = (id: string) => {
    setState(prev => ({
      ...prev,
      projectId: id,
    }));
  };

  const completeOnboarding = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          feedback: null,
          skipped_steps: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      navigate('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const skipOnboarding = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/v1/onboarding/skip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to skip onboarding');
      }

      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      navigate('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to skip onboarding',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setState({
      currentStep: 'welcome',
      userType: null,
      completedSteps: new Set(),
      organizationId: null,
      projectId: null,
      isLoading: false,
      error: null,
    });
  };

  const isStepAccessible = (step: OnboardingStep): boolean => {
    const steps = getRelevantSteps();
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (stepIndex === -1) return false;
    
    if (stepIndex <= currentIndex) return true;
    
    if (stepIndex === currentIndex + 1) {
      if (state.currentStep === 'user-type' && !state.userType) return false;
      if (state.currentStep === 'organization' && !state.organizationId) return false;
      if (state.currentStep === 'project' && !state.projectId) return false;
      return true;
    }
    
    return false;
  };

  const value: OnboardingContextType = {
    ...state,
    setUserType,
    nextStep,
    previousStep,
    goToStep,
    markStepCompleted,
    setOrganizationId,
    setProjectId,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    isStepAccessible,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};