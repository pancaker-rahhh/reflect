import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { onboardingApi } from '../lib/api'

export type UserType = 'solo' | 'team'

export type OnboardingStep = 'profile' | 'project'

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
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: OnboardingStep) => void
  markStepCompleted: (step: OnboardingStep) => void
  setOrganizationId: (id: string) => void
  setProjectId: (id: string) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  isStepAccessible: (step: OnboardingStep) => boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STORAGE_KEY = 'reflect_onboarding_state'

const getSteps = (): OnboardingStep[] => ['profile', 'project']

interface OnboardingProviderProps {
  children: ReactNode
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: _user } = useAuth()

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

    const initialUserType = null
    const initialStep: OnboardingStep = 'profile'
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

  const getRelevantSteps = (): OnboardingStep[] => getSteps()

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
      const targetStep = steps[currentIndex - 1]
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
      // Log the current state for debugging
      console.log('Completing onboarding with state:', {
        organizationId: state.organizationId,
        projectId: state.projectId,
        completedSteps: Array.from(state.completedSteps),
      })

      await onboardingApi.complete({
        feedback: null,
        skipped_steps: [],
      })

      // Invalidate queries to refetch updated organization and project data
      await queryClient.invalidateQueries({ queryKey: ['organization'] })
      await queryClient.invalidateQueries({ queryKey: ['projects'] })

      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      // Use replace to prevent going back to onboarding via browser back button
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
      }))
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setState({
      currentStep: 'profile',
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
      if (state.currentStep === 'project' && !state.projectId) return false
      return true
    }

    return false
  }

  const value: OnboardingContextType = {
    ...state,
    nextStep,
    previousStep,
    goToStep,
    markStepCompleted,
    setOrganizationId,
    setProjectId,
    completeOnboarding,
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
