import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useSession } from '../../contexts/AuthContext'
import { onboardingApi } from '../../lib/api'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const session = useSession()
  const [isChecking, setIsChecking] = useState(true)
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)
  const lastCheckRef = useRef<number>(0)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading || !session) {
        return
      }

      const now = Date.now()
      const timeSinceLastCheck = now - lastCheckRef.current
      const shouldCheck = !hasCheckedOnboarding || timeSinceLastCheck > 5 * 60 * 1000 // 5 minutes

      if (!shouldCheck) {
        setIsChecking(false)
        return
      }

      const isOnboardingRoute = location.pathname.startsWith('/onboarding')

      try {
        const data = await onboardingApi.checkFirstTime()

        if (data.is_first_time && !isOnboardingRoute) {
          // Clear any existing onboarding state to ensure fresh start
          localStorage.removeItem('reflect_onboarding_state')
          navigate('/onboarding')
        } else if (!data.is_first_time && isOnboardingRoute) {
          // Use replace to prevent going back to onboarding via browser back button
          navigate('/app/dashboard', { replace: true })
        }

        setHasCheckedOnboarding(true)
        lastCheckRef.current = now
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [user, authLoading, session, navigate, location.pathname, hasCheckedOnboarding])

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
