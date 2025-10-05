import { createRoot } from 'react-dom/client'
import { WidgetCore } from './components/widgets/core/WidgetCore'
import './widget.css'
import type {
  WidgetConfiguration,
  FeedbackData,
  FeedbackType,
} from './components/widgets/core/types'

interface ReflectConfig {
  key: string
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left' | 'mid-right' | 'mid-left'
}

interface WidgetConfig {
  theme_configuration?: {
    primary?: string
    background?: string
    text?: string
    show_branding?: boolean
  }
  position?: string
  widget_type?: string
  primaryType?: string
  configuration?: {
    content?: {
      headerTitle?: string
      mainQuestion?: string
      submitButtonText?: string
      thankYouTitle?: string
      thankYouMessage?: string
    }
    typeSpecificSettings?: {
      perTypeContent?: Partial<
        Record<
          FeedbackType,
          Partial<{
            headerTitle: string
            mainQuestion: string
            submitButtonText: string
            thankYouTitle: string
            thankYouMessage: string
          }>
        >
      >
    }
    modules?: {
      feedback?: boolean
      reviews?: boolean
      bugReporting?: boolean
      featureRequests?: boolean
    }
  }
}

declare global {
  interface Window {
    reflectConfig: ReflectConfig
    __REFLECT_WIDGET_CONFIG__?: WidgetConfig
  }
}

;(function () {
  let isWidgetOpen = false
  let widgetContainer: HTMLDivElement | null = null
  let launcherContainer: HTMLDivElement | null = null

  function adjustColorBrightness(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * amount)
    const R = (num >> 16) + amt
    const B = ((num >> 8) & 0x00ff) + amt
    const G = (num & 0x0000ff) + amt
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  // Use actual colors from configuration
  function getConfigColors(themeConfig: any) {
    return {
      primary: themeConfig?.primary || '#0066FF',
      headerGradientEnd: themeConfig?.headerGradientEnd,
      background: themeConfig?.background || '#FFFFFF',
      text: themeConfig?.text || '#000000',
      buttonColor: themeConfig?.buttonColor || '#0066FF',
      buttonTextColor: themeConfig?.buttonTextColor || '#FFFFFF',
    }
  }

  function injectWidgetStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes reflect-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes reflect-slideUp {
        from {
          opacity: 0;
          transform: translateY(100%) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes reflect-slideDown {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(100%) scale(0.95);
        }
      }

      @keyframes reflect-fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .reflect-widget-container {
        animation: reflect-slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .reflect-widget-container.closing {
        animation: reflect-slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Special handling for center positioned widgets */
      .reflect-widget-container[style*="transform: translate(-50%, -50%)"] {
        animation: reflect-fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .reflect-widget-container[style*="transform: translate(-50%, -50%)"].closing {
        animation: reflect-fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse;
      }

      /* Ensure center positioned widgets maintain their transform during animations */
      .reflect-widget-container[style*="transform: translate(-50%, -50%)"] {
        transform-origin: center center;
      }

      .reflect-widget-launcher {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }

      .reflect-widget-launcher:hover {
        animation: none !important;
      }

      /* Custom scrollbar styling for widget */
      .reflect-widget-container::-webkit-scrollbar {
        width: 6px;
      }

      .reflect-widget-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }

      .reflect-widget-container::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
      }

      .reflect-widget-container::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
      }

      /* For Firefox */
      .reflect-widget-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
      }
    `
    document.head.appendChild(style)
  }

  function generateLauncherIcon(_config: WidgetConfig): string {
    // Always show chat/message icon regardless of modules or primary type
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5"/>
        <path d="M18 13a3 3 0 1 0-3.5-3.5"/>
      </svg>
    `
  }
  //uncomment when actually using the close icon:)
  // const _closeIcon = `
  //   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  //     <line x1="18" y1="6" x2="6" y2="18"></line>
  //     <line x1="6" y1="6" x2="18" y2="18"></line>
  //   </svg>
  // `

  // Global error handler for the widget
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Reflect Widget')) {
      console.error('Reflect Widget: Unhandled error', event.error)
      // Could send error to analytics service here
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      typeof event.reason === 'string' &&
      event.reason.includes('Reflect Widget')
    ) {
      console.error('Reflect Widget: Unhandled promise rejection', event.reason)
      // Could send error to analytics service here
    }
  })

  if (!window.reflectConfig || !window.reflectConfig.key) {
    console.error(
      'Reflect Widget: Configuration object (window.reflectConfig) not found or public key is missing.'
    )
    return
  }

  const publicKey = window.reflectConfig.key
  const configTheme = window.reflectConfig.theme || 'light'
  const configPosition = window.reflectConfig.position || 'bottom-right'

  // Helper function to normalize position format (convert underscores to hyphens)
  function normalizePosition(position: string): string {
    return position.replace(/_/g, '-')
  }

  // Use environment-based URLs
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const apiUrl = `${apiBaseUrl}/public/widgets/${publicKey}`

  injectWidgetStyles()

  // Check for embedded config first (injected by CDN deployment)
  function getEmbeddedConfig(): WidgetConfig | null {
    if (window.__REFLECT_WIDGET_CONFIG__) {
      return window.__REFLECT_WIDGET_CONFIG__ as WidgetConfig
    }
    return null
  }

  // Add retry logic with exponential backoff for API fallback
  function fetchConfigWithRetry(retries = 3, delay = 1000): Promise<WidgetConfig> {
    return fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Widget configuration not found. Status: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        if (retries > 0) {
          console.warn(`Reflect Widget: Retrying config fetch. Attempts left: ${retries}`)
          return new Promise((resolve) => {
            setTimeout(() => resolve(fetchConfigWithRetry(retries - 1, delay * 2)), delay)
          })
        }
        throw error
      })
  }

  // Try embedded config first, then fall back to API
  const embeddedConfig = getEmbeddedConfig()
  if (embeddedConfig) {
    renderLauncher(embeddedConfig)
  } else {
    fetchConfigWithRetry()
      .then((config: WidgetConfig) => {
        renderLauncher(config)
      })
      .catch((error) => {
        console.error('Reflect Widget: Failed to load configuration after retries.', error)
        // Show minimal fallback widget
        renderFallbackLauncher()
      })
  }

  // Convert backend config to WidgetConfiguration format
  function transformWidgetConfig(backendConfig: WidgetConfig): WidgetConfiguration {
    const theme = backendConfig.theme_configuration || {}
    const content = backendConfig.configuration?.content || {}
    const modules = backendConfig.configuration?.modules || {}
    const perTypeContent = backendConfig.configuration?.typeSpecificSettings?.perTypeContent || {}
    // Extract the actual type from enum format (e.g., "WidgetType.CSAT" -> "CSAT")
    const widgetType = backendConfig.widget_type?.split('.')?.pop()?.toUpperCase()

    // Map widget types to modules properly
    const defaultModules = getDefaultModulesForType(widgetType)

    // Use explicit modules if provided, otherwise fall back to defaults based on widget type
    const finalModules = {
      feedback: modules.feedback !== undefined ? modules.feedback : defaultModules.feedback,
      reviews: modules.reviews !== undefined ? modules.reviews : defaultModules.reviews,
      bugReporting:
        modules.bugReporting !== undefined ? modules.bugReporting : defaultModules.bugReporting,
      featureRequests:
        modules.featureRequests !== undefined
          ? modules.featureRequests
          : defaultModules.featureRequests,
    }

    const result = {
      modules: finalModules,
      primaryType: (widgetType || 'FEEDBACK') as FeedbackType,
      content: {
        headerTitle: content.headerTitle || 'We value your feedback',
        mainQuestion: content.mainQuestion || getDefaultQuestionForType(backendConfig.widget_type),
        submitButtonText: content.submitButtonText || 'Submit Feedback',
        thankYouTitle: content.thankYouTitle || 'Thank you!',
        thankYouMessage: content.thankYouMessage || 'Your feedback helps us improve.',
      },
      contentByType: perTypeContent as WidgetConfiguration['contentByType'],
      appearance: {
        theme: (configTheme === 'dark'
          ? 'minimal-dark'
          : 'default') as WidgetConfiguration['appearance']['theme'],
        position: normalizePosition(
          backendConfig.position || configPosition
        ) as WidgetConfiguration['appearance']['position'],
        colors: getConfigColors(theme),
        showBranding: theme.show_branding !== false,
      },
      behavior: {
        triggerType: 'immediate' as WidgetConfiguration['behavior']['triggerType'],
        urlTargeting: { includeUrls: [], excludeUrls: [] },
        deviceTypes: { desktop: true, mobile: true, tablet: true },
      },
    }

    return result
  }

  function getDefaultModulesForType(type?: string) {
    switch (type) {
      case 'REVIEW':
        return { feedback: false, reviews: true, bugReporting: false, featureRequests: false }
      case 'BUG_REPORT':
        return { feedback: false, reviews: false, bugReporting: true, featureRequests: false }
      case 'FEATURE_REQUEST':
        return { feedback: false, reviews: false, bugReporting: false, featureRequests: true }
      case 'NPS':
      case 'CSAT':
      case 'CES':
      case 'SURVEY':
        return { feedback: true, reviews: false, bugReporting: false, featureRequests: false }
      default:
        return { feedback: true, reviews: false, bugReporting: false, featureRequests: false }
    }
  }

  function getDefaultQuestionForType(type?: string) {
    switch (type?.toUpperCase()) {
      case 'NPS':
        return 'How likely are you to recommend our product to a friend or colleague?'
      case 'CSAT':
        return 'Please rate your overall satisfaction with our service'
      case 'CES':
        return 'How easy was it to get the help you needed?'
      case 'REVIEW':
        return 'How would you rate your overall experience?'
      case 'BUG_REPORT':
        return 'Please describe the issue you encountered'
      case 'FEATURE_REQUEST':
        return 'What feature would you like to see added?'
      default:
        return 'How can we improve?'
    }
  }

  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen
    if (isWidgetOpen) {
      // Try to use embedded config first, then fall back to API fetch
      let config: WidgetConfig | null = null

      if (window.__REFLECT_WIDGET_CONFIG__) {
        config = window.__REFLECT_WIDGET_CONFIG__ as WidgetConfig
      } else {
        // Fall back to API fetch if no embedded config
        fetch(apiUrl)
          .then((response) => response.json())
          .then((apiConfig: WidgetConfig) => {
            config = apiConfig
            createAndShowWidget(config)
          })
          .catch((error) => {
            console.error('Failed to load widget config:', error)
            // If config fails, try to show existing widget
            if (widgetContainer) {
              showWidget()
            }
          })
        return
      }

      // Use embedded config directly
      createAndShowWidget(config)
    } else {
      hideWidget()

      if (launcherContainer) {
        launcherContainer.style.transform = 'rotate(90deg)'
        setTimeout(() => {
          if (launcherContainer) {
            // Use a simple fallback icon when config is not available
            launcherContainer.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5"/>
                <path d="M18 13a3 3 0 1 0-3.5-3.5"/>
              </svg>
            `
            launcherContainer.style.transform = 'rotate(0deg)'
          }
        }, 150)
      }
    }
  }

  function createAndShowWidget(config: WidgetConfig) {
    // Remove existing widget if it exists
    if (widgetContainer) {
      widgetContainer.remove()
      widgetContainer = null
    }
    // Create fresh widget container
    widgetContainer = createWidgetContainer(config)
    document.body.appendChild(widgetContainer)
    showWidget()
  }

  function showWidget() {
    if (widgetContainer) {
      widgetContainer.style.display = 'block'
      widgetContainer.classList.remove('closing')
    }
  }

  function hideWidget() {
    if (widgetContainer) {
      widgetContainer.classList.add('closing')
      setTimeout(() => {
        if (widgetContainer) {
          widgetContainer.style.display = 'none'
          widgetContainer.classList.remove('closing')
        }
      }, 300)
    }
  }

  function createWidgetContainer(backendConfig: WidgetConfig): HTMLDivElement {
    const container = document.createElement('div')
    container.className = 'reflect-widget-container'
    container.id = 'reflect-widget-container'

    // Apply theme-based styling
    const theme = configTheme === 'dark' ? 'dark' : 'light'
    const themeStyles = getThemeStyles(theme)

    Object.assign(container.style, {
      position: 'fixed',
      width: '380px',
      maxWidth: 'calc(100vw - 40px)',
      height: '520px',
      maxHeight: 'calc(100vh - 120px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      background: `linear-gradient(135deg, ${themeStyles.background}ee, ${themeStyles.background}f5)`,
      color: themeStyles.text,
      boxShadow:
        '0 24px 48px rgba(0,0,0,0.1), 0 12px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.05)',
      display: 'none',
      zIndex: '9998',
      overflow: 'visible',
      scrollBehavior: 'smooth',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      lineHeight: '1.4',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    })

    // Apply positioning - clear all position properties first, then set the correct ones
    const position = normalizePosition(
      window.reflectConfig?.position || backendConfig.position || configPosition
    )

    container.style.top = ''
    container.style.bottom = ''
    container.style.left = ''
    container.style.right = ''
    container.style.transform = ''

    if (position === 'bottom-right') {
      container.style.bottom = '20px'
      container.style.right = '20px'
    } else if (position === 'bottom-left') {
      container.style.bottom = '20px'
      container.style.left = '20px'
    } else if (position === 'mid-right') {
      container.style.top = '50%'
      container.style.right = '0px'
      container.style.transform = 'translateY(-50%)'
    } else if (position === 'mid-left') {
      container.style.top = '50%'
      container.style.left = '0px'
      container.style.transform = 'translateY(-50%)'
    }

    // Create React render target
    const widgetConfig = {
      ...transformWidgetConfig(backendConfig),
      widgetKey: publicKey,
    }

    const handleSubmit = async (data: FeedbackData) => {
      // Submit feedback via API with retry logic
      async function submitWithRetry(retries = 2): Promise<void> {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const payload = {
            widgetKey: publicKey,
            rating: data.rating,
            message: data.response || '',
            feedbackType: data.feedbackType?.toLowerCase() || 'general',
            // Include type-specific data
            ...(data.typeSpecificData || {}),
            // For REVIEW feedback, ensure overall_rating is set
            ...(data.feedbackType === 'REVIEW' && data.rating
              ? { overall_rating: data.rating }
              : {}),
          }

          const response = await fetch(`${apiBaseUrl}/public/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            // Handle rate limiting with detailed error information
            if (response.status === 429) {
              try {
                const errorData = await response.json()
                const retryAfter = response.headers.get('Retry-After')
                const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
                const retryMinutes = Math.ceil(retrySeconds / 60)

                // Use the detailed message from the backend if available
                const message =
                  errorData?.detail?.message || errorData?.message || 'Too many requests'
                throw new Error(
                  `${message}. Please try again in ${retryMinutes} minute${
                    retryMinutes !== 1 ? 's' : ''
                  }.`
                )
              } catch (parseError) {
                // Fallback if JSON parsing fails
                const retryAfter = response.headers.get('Retry-After')
                const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
                const retryMinutes = Math.ceil(retrySeconds / 60)
                throw new Error(
                  `Too many requests. Please try again in ${retryMinutes} minute${
                    retryMinutes !== 1 ? 's' : ''
                  }.`
                )
              }
            }

            const errorText = await response.text().catch(() => 'Unknown error')
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          // Success
          return
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection.')
          }

          // Handle specific HTTP errors with user-friendly messages
          if (error instanceof Error && error.message.includes('HTTP')) {
            const statusMatch = error.message.match(/HTTP (\d+)/)
            if (statusMatch) {
              const status = parseInt(statusMatch[1])
              if (status === 400) {
                throw new Error('Invalid feedback data. Please check your input and try again.')
              } else if (status === 404) {
                throw new Error('Widget configuration not found. Please contact support.')
              } else if (status >= 500) {
                // Server errors should be retried
                if (retries > 0) {
                  console.warn(`Server error (${status}), retrying... (${retries} attempts left)`)
                  await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds for server errors
                  return submitWithRetry(retries - 1)
                }
                throw new Error('Server temporarily unavailable. Please try again later.')
              }
            }
          }

          // Network errors should be retried
          if (error instanceof TypeError && error.message.includes('fetch')) {
            if (retries > 0) {
              console.warn(`Network error, retrying... (${retries} attempts left)`)
              await new Promise((resolve) => setTimeout(resolve, 1000))
              return submitWithRetry(retries - 1)
            }
            throw new Error('Network error. Please check your internet connection.')
          }

          // Generic retry logic for other errors
          if (retries > 0) {
            console.warn(`Feedback submission failed, retrying... (${retries} attempts left)`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return submitWithRetry(retries - 1)
          }

          throw error
        }
      }

      return submitWithRetry()
    }

    const handleClose = () => {
      isWidgetOpen = false
      hideWidget()

      if (launcherContainer) {
        launcherContainer.style.transform = 'rotate(90deg)'
        setTimeout(() => {
          if (launcherContainer) {
            launcherContainer.innerHTML = backendConfig ? generateLauncherIcon(backendConfig) : ''
            launcherContainer.style.transform = 'rotate(0deg)'
          }
        }, 150)
      }
    }

    try {
      const root = createRoot(container)
      root.render(
        <WidgetCore
          config={widgetConfig}
          mode="production"
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )
    } catch (error) {
      console.error('Reflect Widget: Error rendering widget:', error)
      // Fallback to simple text widget if hooks fail
      container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>Feedback Widget</h3>
          <p>There was an issue loading the widget. Please refresh the page.</p>
          <small>Error: ${error instanceof Error ? error.message : String(error)}</small>
        </div>
      `
    }

    return container
  }

  function getThemeStyles(theme: string) {
    if (theme === 'dark') {
      return {
        background: '#1f2937',
        text: '#f9fafb',
        hoverBackground: 'rgba(255, 255, 255, 0.1)',
        primary: '#3b82f6',
        secondary: '#6b7280',
      }
    } else {
      return {
        background: '#ffffff',
        text: '#1f2937',
        hoverBackground: 'rgba(0, 0, 0, 0.05)',
        primary: '#3b82f6',
        secondary: '#6b7280',
      }
    }
  }

  function renderLauncher(config: WidgetConfig) {
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher'
    launcherContainer.className = 'reflect-widget-launcher'
    launcherContainer.onclick = toggleWidget

    const theme = config.theme_configuration || {}
    const themeColors = getConfigColors(theme)
    const primaryColor = themeColors.primary
    const darkerColor = adjustColorBrightness(primaryColor, -20)

    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      cursor: 'pointer',
      background: `linear-gradient(135deg, ${primaryColor}, ${darkerColor})`,
      height: '56px',
      width: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow:
        '0 12px 32px rgba(0,0,0,0.15), 0 6px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      border: '2px solid rgba(255,255,255,0.2)',
      color: '#FFFFFF',
      // animation removed per request
    })

    // Apply position from config first, with window.reflectConfig.position as override
    const position = normalizePosition(
      window.reflectConfig?.position || config.position || configPosition
    )

    // Store the base transform for center positioning
    const baseTransform = position === 'center' ? 'translate(-50%, -50%)' : ''

    launcherContainer.onmouseover = () => {
      if (launcherContainer) {
        const hoverTransform =
          position === 'center'
            ? 'translate(-50%, -50%) scale(1.1) translateY(-2px)'
            : 'scale(1.1) translateY(-2px)'
        launcherContainer.style.transform = hoverTransform
        launcherContainer.style.boxShadow =
          '0 12px 35px rgba(0,0,0,0.25), 0 6px 15px rgba(0,0,0,0.15)'
        launcherContainer.style.animation = 'none'
      }
    }
    launcherContainer.onmouseout = () => {
      if (launcherContainer) {
        launcherContainer.style.transform = baseTransform
        launcherContainer.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1)'
        launcherContainer.style.animation = 'none'
      }
    }

    launcherContainer.onmousedown = () => {
      if (launcherContainer) {
        const downTransform =
          position === 'center' ? 'translate(-50%, -50%) scale(0.95)' : 'scale(0.95)'
        launcherContainer.style.transform = downTransform
      }
    }
    launcherContainer.onmouseup = () => {
      if (launcherContainer) {
        const upTransform =
          position === 'center'
            ? 'translate(-50%, -50%) scale(1.1) translateY(-2px)'
            : 'scale(1.1) translateY(-2px)'
        launcherContainer.style.transform = upTransform
      }
    }

    // Clear all position properties first, then set the correct ones
    launcherContainer.style.top = ''
    launcherContainer.style.bottom = ''
    launcherContainer.style.left = ''
    launcherContainer.style.right = ''
    launcherContainer.style.transform = ''

    if (position === 'bottom-right') {
      launcherContainer.style.bottom = '20px'
      launcherContainer.style.right = '20px'
    } else if (position === 'bottom-left') {
      launcherContainer.style.bottom = '20px'
      launcherContainer.style.left = '20px'
    } else if (position === 'mid-right') {
      launcherContainer.style.top = '50%'
      launcherContainer.style.right = '0px'
      launcherContainer.style.transform = 'translateY(-50%)'
    } else if (position === 'mid-left') {
      launcherContainer.style.top = '50%'
      launcherContainer.style.left = '0px'
      launcherContainer.style.transform = 'translateY(-50%)'
    }

    launcherContainer.innerHTML = config ? generateLauncherIcon(config) : ''

    document.body.appendChild(launcherContainer)
  }

  function renderFallbackLauncher() {
    // Minimal fallback widget when config fails to load
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher-fallback'
    launcherContainer.className = 'reflect-widget-launcher'
    launcherContainer.onclick = () => {
      console.error('Widget temporarily unavailable. Please refresh the page or try again later.')
      // Show a temporary visual indicator instead of alert
      if (launcherContainer) {
        launcherContainer.style.opacity = '0.5'
        setTimeout(() => {
          if (launcherContainer) {
            launcherContainer.style.opacity = '1'
          }
        }, 1000)
      }
    }

    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      cursor: 'pointer',
      background: '#e74c3c',
      height: '56px',
      width: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255,255,255,0.2)',
      color: '#FFFFFF',
      fontSize: '24px',
    })

    // Apply position from config for fallback launcher
    const position = normalizePosition(configPosition || 'bottom-right')
    if (position.includes('bottom')) launcherContainer.style.bottom = '20px'
    if (position.includes('top')) launcherContainer.style.top = '20px'
    if (position.includes('right')) launcherContainer.style.right = '20px'
    if (position.includes('left')) launcherContainer.style.left = '20px'
    if (position === 'center') {
      launcherContainer.style.top = '50%'
      launcherContainer.style.left = '50%'
      launcherContainer.style.transform = 'translate(-50%, -50%)'
    }

    launcherContainer.innerHTML = '⚠️'
    launcherContainer.title = 'Widget Error - Click for details'

    document.body.appendChild(launcherContainer)
  }
})()
