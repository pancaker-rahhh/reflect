import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

function load(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement('script')
  s.src = src
  s.async = true
  Object.keys(attrs).forEach((k) => s.setAttribute(k, attrs[k]))
  document.head.appendChild(s)
}

function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_ID
  if (!gaId) return

  // Load Google Analytics 4
  load(`https://www.googletagmanager.com/gtag/js?id=${gaId}`)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', gaId, {
    page_title: document.title,
    page_location: window.location.href,
  })

  // Track page views on route changes
  const handleRouteChange = () => {
    gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }

  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', handleRouteChange)
}

export const Analytics = () => {
  useEffect(() => {
    // Defer analytics loading until idle
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        requestIdleCallback(initAnalytics, { timeout: 3000 })
      } else {
        window.addEventListener('load', initAnalytics)
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
