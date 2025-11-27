import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function usePageAnalytics() {
  const location = useLocation()

  useEffect(() => {
    // Only track if PostHog is available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog

      // Capture pageview event
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path: location.pathname,
      })
    }
  }, [location.pathname])
}
