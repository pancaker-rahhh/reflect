import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useSession } from '../../contexts/AuthContext'
import { onboardingApi, organizationApi } from '../../lib/api'

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
        console.log('OnboardingGuard: Checking first-time user status...')
        const data = await onboardingApi.checkFirstTime()
        console.log('OnboardingGuard: First-time check result:', data)

        if (data.is_first_time && !isOnboardingRoute) {
          // Clear any existing onboarding state to ensure fresh start
          localStorage.removeItem('reflect_onboarding_state')
          navigate('/onboarding', { replace: true })
        } else if (!data.is_first_time && isOnboardingRoute) {
          // Double-check that user actually has required resources before allowing dashboard access
          try {
            const organization = await organizationApi.getMyOrganization()
            if (organization) {
              // User has completed onboarding and has an organization
              navigate('/app/dashboard', { replace: true })
            } else {
              // User marked as completed but missing organization - force onboarding
              console.warn('User marked as onboarded but missing organization, forcing onboarding')
              localStorage.removeItem('reflect_onboarding_state')
              navigate('/onboarding', { replace: true })
            }
          } catch (orgError) {
            console.error('Error checking organization status:', orgError)
            // If we can't verify organization status, stay on onboarding to be safe
            if (!isOnboardingRoute) {
              navigate('/onboarding', { replace: true })
            }
          }
        }

        setHasCheckedOnboarding(true)
        lastCheckRef.current = now
      } catch (error) {
        console.error('OnboardingGuard: Failed to check onboarding status:', error)

        // Check if it's a CORS error
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message)
          if (errorMessage.includes('CORS') || errorMessage.includes('blocked by CORS')) {
            console.error(
              'OnboardingGuard: CORS error detected - this usually happens on the first call'
            )
            // Don't redirect immediately on CORS errors - let it retry
            setIsChecking(false)
            return
          }
        }

        // On other errors, redirect to onboarding to be safe
        if (!isOnboardingRoute) {
          navigate('/onboarding', { replace: true })
        }
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
