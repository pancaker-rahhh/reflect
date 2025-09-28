import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const usePreventNavigation = (shouldPrevent: boolean = true) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!shouldPrevent) return

    let isNavigationPrevented = false

    const preventNavigation = () => {
      if (isNavigationPrevented) return
      isNavigationPrevented = true

      // Force stay on onboarding page
      navigate('/onboarding', { replace: true })

      setTimeout(() => {
        isNavigationPrevented = false
      }, 100)
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      preventNavigation()

      // Push multiple history entries to make it harder to navigate away
      window.history.pushState({ onboarding: true }, '', '/onboarding')
      window.history.pushState({ onboarding: true }, '', '/onboarding')

      console.warn('🚫 Navigation blocked during onboarding')
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave? Your onboarding progress will be lost.'
      return event.returnValue
    }

    // Initialize history state
    window.history.replaceState({ onboarding: true }, '', '/onboarding')
    window.history.pushState({ onboarding: true }, '', '/onboarding')
    window.history.pushState({ onboarding: true }, '', '/onboarding')

    // Add listeners
    window.addEventListener('popstate', handlePopState, true)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Also prevent programmatic navigation
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (state, title, url) {
      const urlStr = url?.toString() || ''
      const isAllowedNavigation =
        urlStr.includes('/onboarding') || urlStr.includes('/app/dashboard')

      if (shouldPrevent && url && !isAllowedNavigation) {
        console.warn('🚫 Programmatic navigation blocked during onboarding:', url)
        return
      }

      if (urlStr.includes('/app/dashboard')) {
        console.log('✅ Allowing navigation to dashboard after onboarding completion')
      }

      return originalPushState.apply(window.history, [state, title, url])
    }

    window.history.replaceState = function (state, title, url) {
      const urlStr = url?.toString() || ''
      const isAllowedNavigation =
        urlStr.includes('/onboarding') || urlStr.includes('/app/dashboard')

      if (shouldPrevent && url && !isAllowedNavigation) {
        console.warn('🚫 Programmatic navigation blocked during onboarding:', url)
        return
      }

      if (urlStr.includes('/app/dashboard')) {
        console.log('✅ Allowing navigation to dashboard after onboarding completion')
      }

      return originalReplaceState.apply(window.history, [state, title, url])
    }

    return () => {
      window.removeEventListener('popstate', handlePopState, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Restore original methods
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [shouldPrevent, navigate])
}
