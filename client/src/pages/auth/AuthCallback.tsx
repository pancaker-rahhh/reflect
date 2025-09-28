import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { SyncLoader } from '../../components/auth/SyncLoader'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, syncing, loading } = useAuth()
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check for auth errors in URL params
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    if (error || errorCode) {
      console.error('Auth callback error:', { error, errorCode, errorDescription })
      setHasError(true)

      // If this is a flow state error, likely from browser back button during onboarding
      if (errorCode === 'flow_state_not_found') {
        // Clear any auth state and redirect to login
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
        return
      }
    }

    // Navigate to app dashboard when auth is complete and sync is done
    // The OnboardingGuard will redirect to onboarding if needed
    if (user && !syncing && !loading && !hasError) {
      navigate('/app/dashboard')
    }
  }, [user, syncing, loading, navigate, searchParams, hasError])

  // Show error state if there's an auth error
  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            There was an issue with the authentication flow. This usually happens when using the
            browser&apos;s back button during sign-up.
          </p>
          <p className="text-sm text-gray-500">Redirecting you to the login page...</p>
        </div>
      </div>
    )
  }

  // Show sync loader while authenticating or syncing
  if (loading || syncing || user) {
    return <SyncLoader />
  }

  // Fallback loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
