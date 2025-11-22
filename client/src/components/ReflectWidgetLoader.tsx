import { useEffect } from 'react'

/**
 * Non-blocking loader for Reflect widget script.
 * Loads the widget after page load or during idle time to improve Core Web Vitals.
 */
export default function ReflectWidgetLoader() {
  useEffect(() => {
    function loadScript() {
      // Prevent duplicate script injection
      if (document.querySelector('script[data-reflect-widget]')) return

      const s = document.createElement('script')
      s.src = 'https://cdn.reflectfeedback.com/widgets/widget_f278b31f1ae540e6/widget.js'
      s.setAttribute('data-reflect-widget', '1')
      s.async = true
      document.body.appendChild(s)
    }

    // Use requestIdleCallback if available (loads during browser idle time)
    // Fallback to window.load event for older browsers
    if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(loadScript, { timeout: 2000 })
    } else {
      // Fallback: load after window.load event
      if (document.readyState === 'complete') {
        loadScript()
      } else {
        if (typeof window !== 'undefined') {
          window.addEventListener('load', loadScript)
        }
      }
    }
  }, [])

  return null
}
