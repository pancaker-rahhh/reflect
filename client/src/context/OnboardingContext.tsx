import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { onboardingApi } from '../lib/api'
import { isFeatureEnabled } from '../lib/featureFlags'

export type UserType = 'solo' | 'team'

export type OnboardingStep =
  | 'welcome'
  | 'user-type'
  | 'profile'
  | 'organization'
  | 'project'
  | 'team-setup'
  | 'completion'

interface OnboardingState {
  currentStep: OnboardingStep
  userType: UserType | null
  completedSteps: Set<OnboardingStep>
  organizationId: string | null
  projectId: string | null
  isLoading: boolean
  error: string | null
}

interface OnboardingContextType extends OnboardingState {
  setUserType: (type: UserType) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: OnboardingStep) => void
  markStepCompleted: (step: OnboardingStep) => void
  setOrganizationId: (id: string) => void
  setProjectId: (id: string) => void
  completeOnboarding: () => Promise<void>
  skipOnboarding: () => Promise<void>
  resetOnboarding: () => void
  isStepAccessible: (step: OnboardingStep) => boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STORAGE_KEY = 'reflect_onboarding_state'

const getSteps = (userType: UserType | null, skipUserTypeSelection: boolean): OnboardingStep[] => {
  if (skipUserTypeSelection) {
    return ['welcome', 'profile', 'organization', 'project', 'completion']
  }

  if (userType === 'solo') {
    return ['welcome', 'user-type', 'profile', 'organization', 'project', 'completion']
  }

  return ['welcome', 'user-type', 'profile', 'organization', 'project', 'team-setup', 'completion']
}

interface OnboardingProviderProps {
  children: ReactNode
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: _user } = useAuth()
  const skipUserTypeSelection = isFeatureEnabled('SKIP_USER_TYPE_SELECTION')

  const [state, setState] = useState<OnboardingState>(() => {
    const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        return {
          ...parsed,
          completedSteps: new Set(parsed.completedSteps || []),
        }
      } catch (error) {
        console.error('Failed to parse saved onboarding state:', error)
      }
    }

    // If skipping user type selection, auto-set to solo
    const initialUserType = skipUserTypeSelection ? 'solo' : null
    const initialStep = 'welcome' // Always start with welcome page for good UX
    // Don't pre-mark skipped steps as completed - they shouldn't count toward progress
    const initialCompletedSteps = new Set()

    return {
      currentStep: initialStep,
      userType: initialUserType,
      completedSteps: initialCompletedSteps,
      organizationId: null,
      projectId: null,
      isLoading: false,
      error: null,
    }
  })

  useEffect(() => {
    const stateToSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
    }
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stateToSave))
  }, [state])

  const getRelevantSteps = (): OnboardingStep[] => {
    return getSteps(state.userType, skipUserTypeSelection)
  }

  const setUserType = (type: UserType) => {
    setState((prev) => ({
      ...prev,
      userType: type,
      // Only mark user-type as completed if it's actually a visible step
      completedSteps: skipUserTypeSelection
        ? prev.completedSteps
        : new Set([...prev.completedSteps, 'user-type']),
    }))
  }

  const nextStep = () => {
    const steps = getRelevantSteps()
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      setState((prev) => ({
        ...prev,
        currentStep: nextStep,
        completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
      }))
    }
  }

  const previousStep = () => {
    const steps = getRelevantSteps()
    const currentIndex = steps.indexOf(state.currentStep)

    if (currentIndex > 0) {
      let targetStep = steps[currentIndex - 1]

      // If we're using the feature flag and the target step is organization,
      // skip it and go to the step before that (since org auto-advances)
      if (skipUserTypeSelection && targetStep === 'organization' && currentIndex > 1) {
        targetStep = steps[currentIndex - 2]
      }

      setState((prev) => ({
        ...prev,
        currentStep: targetStep,
      }))
    }
  }

  const goToStep = (step: OnboardingStep) => {
    if (!isStepAccessible(step)) return
    setState((prev) => {
      if (prev.currentStep === step) return prev
      return {
        ...prev,
        currentStep: step,
      }
    })
  }

  const markStepCompleted = (step: OnboardingStep) => {
    setState((prev) => {
      if (prev.completedSteps.has(step)) return prev
      return {
        ...prev,
        completedSteps: new Set([...prev.completedSteps, step]),
      }
    })
  }

  const setOrganizationId = (id: string) => {
    setState((prev) => ({
      ...prev,
      organizationId: id,
    }))
  }

  const setProjectId = (id: string) => {
    setState((prev) => ({
      ...prev,
      projectId: id,
    }))
  }

  const completeOnboarding = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await onboardingApi.complete({
        feedback: null,
        skipped_steps: [],
      })

      // Invalidate queries to refetch updated organization and project data
      await queryClient.invalidateQueries({ queryKey: ['organizations'] })
      await queryClient.invalidateQueries({ queryKey: ['projects'] })

      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      // Use replace to prevent going back to onboarding via browser back button
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
      }))
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const skipOnboarding = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await onboardingApi.skip()

      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      // Use replace to prevent going back to onboarding via browser back button
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to skip onboarding',
      }))
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setState({
      currentStep: 'welcome',
      userType: null,
      completedSteps: new Set(),
      organizationId: null,
      projectId: null,
      isLoading: false,
      error: null,
    })
  }

  const isStepAccessible = (step: OnboardingStep): boolean => {
    const steps = getRelevantSteps()
    const stepIndex = steps.indexOf(step)
    const currentIndex = steps.indexOf(state.currentStep)

    if (stepIndex === -1) return false

    if (stepIndex <= currentIndex) return true

    if (stepIndex === currentIndex + 1) {
      if (state.currentStep === 'user-type' && !state.userType) return false
      if (state.currentStep === 'organization' && !state.organizationId) return false
      if (state.currentStep === 'project' && !state.projectId) return false
      return true
    }

    return false
  }

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
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
