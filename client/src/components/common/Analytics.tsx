import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const Analytics = () => {
  useEffect(() => {
    // Defer Google Analytics loading until page is idle or loaded
    const loadAnalytics = () => {
      // Load Google Analytics 4
      const script1 = document.createElement('script')
      script1.async = true
      script1.defer = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`
      document.head.appendChild(script1)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag

      gtag('js', new Date())
      gtag('config', import.meta.env.VITE_GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
      })

      // Track page views on route changes
      const handleRouteChange = () => {
        gtag('config', import.meta.env.VITE_GA_ID, {
          page_title: document.title,
          page_location: window.location.href,
        })
      }

      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', handleRouteChange)
    }

    // Use requestIdleCallback if available, otherwise use load event
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadAnalytics, { timeout: 2000 })
      } else {
        window.addEventListener('load', loadAnalytics)
      }
    }
  }, [])

  return null
}

// Utility functions for tracking events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackConversion = (conversionId: string, value?: number, currency?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency,
    })
  }
}

// Common tracking events
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('click', 'button', `${buttonName} - ${location}`)
}

export const trackFormSubmit = (formName: string) => {
  trackEvent('submit', 'form', formName)
}

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', 'navigation', pageName)
}

export const trackSignup = (method: string) => {
  trackEvent('sign_up', 'engagement', method)
  trackConversion('AW-CONVERSION_ID', 1, 'USD') // Replace with actual conversion ID
}

export const trackTrialStart = () => {
  trackEvent('trial_start', 'engagement')
  trackConversion('AW-CONVERSION_ID', 49, 'USD') // Replace with actual conversion ID
}
