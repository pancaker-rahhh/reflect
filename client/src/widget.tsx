import { render } from 'preact'
import { WidgetCore } from './components/widgets/core/WidgetCore'
import type { 
  WidgetConfiguration,
  FeedbackData,
  FeedbackType,
} from './components/widgets/core/types'

interface ReflectConfig {
  key: string
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
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
  configuration?: {
    content?: {
      headerTitle?: string
      mainQuestion?: string
      submitButtonText?: string
      thankYouTitle?: string
      thankYouMessage?: string
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

      .reflect-widget-launcher {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }

      .reflect-widget-launcher:hover {
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  const launcherIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5"/>
      <path d="M18 13a3 3 0 1 0-3.5-3.5"/>
    </svg>
  `

  const closeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `

  // Global error handler for the widget
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Reflect Widget')) {
      console.error('Reflect Widget: Unhandled error', event.error)
      // Could send error to analytics service here
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('Reflect Widget')) {
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

  // Use environment-based URLs
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const apiUrl = `${apiBaseUrl}/public/widgets/${publicKey}`

  injectWidgetStyles()

  // Add retry logic with exponential backoff
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

  fetchConfigWithRetry()
    .then((config: WidgetConfig) => {
      renderLauncher(config)
    })
    .catch((error) => {
      console.error('Reflect Widget: Failed to load configuration after retries.', error)
      // Show minimal fallback widget
      renderFallbackLauncher()
    })

  // Convert backend config to WidgetConfiguration format
  function transformWidgetConfig(backendConfig: WidgetConfig): WidgetConfiguration {
    const theme = backendConfig.theme_configuration || {}
    const content = backendConfig.configuration?.content || {}
    const modules = backendConfig.configuration?.modules || {}
    const widgetType = backendConfig.widget_type?.toUpperCase()
    
    // Map widget types to modules properly
    const defaultModules = getDefaultModulesForType(widgetType)
    
    // If any modules are explicitly configured, respect that configuration
    // Don't let single-widget defaults override multi-widget configurations
    const hasExplicitModuleConfig = Object.values(modules).some(v => v === true)
    
    const finalModules = {
      feedback: modules.feedback ?? (hasExplicitModuleConfig ? false : defaultModules.feedback),
      reviews: modules.reviews ?? (hasExplicitModuleConfig ? false : defaultModules.reviews),
      bugReporting: modules.bugReporting ?? (hasExplicitModuleConfig ? false : defaultModules.bugReporting),
      featureRequests: modules.featureRequests ?? (hasExplicitModuleConfig ? false : defaultModules.featureRequests),
    }
    
    
    return {
      modules: finalModules,
      primaryType: (widgetType || 'FEEDBACK') as FeedbackType,
      content: {
        headerTitle: 'Feedback',
        mainQuestion: content.mainQuestion || getDefaultQuestionForType(backendConfig.widget_type),
        submitButtonText: content.submitButtonText || 'Submit Feedback',
        thankYouTitle: content.thankYouTitle || 'Thank you!',
        thankYouMessage: content.thankYouMessage || 'Your feedback helps us improve.',
      },
      appearance: {
        theme: configTheme === 'dark' ? 'minimal-dark' : 'default',
        position: (backendConfig.position || configPosition) as WidgetConfiguration['appearance']['position'],
        colors: {
          primary: theme.primary || '#3b82f6',
          background: theme.background || (configTheme === 'dark' ? '#1f2937' : '#ffffff'),
          text: theme.text || (configTheme === 'dark' ? '#f9fafb' : '#1f2937'),
          buttonColor: theme.primary || '#3b82f6',
          buttonTextColor: '#ffffff',
        },
        showBranding: theme.show_branding !== false,
      },
      behavior: {
        triggerType: 'immediate',
        urlTargeting: { includeUrls: [], excludeUrls: [] },
        deviceTypes: { desktop: true, mobile: true, tablet: true },
      },
    }
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
        return 'How likely are you to recommend us to a friend or colleague?'
      case 'CSAT':
        return 'How satisfied are you with our service?'
      case 'CES':
        return 'How easy was it to use our service?'
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
      // Always fetch fresh config to ensure consistent state
      fetch(apiUrl)
        .then((response) => response.json())
        .then((config: WidgetConfig) => {
          // Remove existing widget if it exists
          if (widgetContainer) {
            widgetContainer.remove()
            widgetContainer = null
          }
          // Create fresh widget container
          widgetContainer = createWidgetContainer(config)
          document.body.appendChild(widgetContainer)
          showWidget()
        })
        .catch((error) => {
          console.error('Failed to load widget config:', error)
          // If config fails, try to show existing widget
          if (widgetContainer) {
            showWidget()
          }
        })

      if (launcherContainer) {
        launcherContainer.style.transform = 'rotate(90deg)'
        setTimeout(() => {
          if (launcherContainer) {
            launcherContainer.innerHTML = closeIcon
            launcherContainer.style.transform = 'rotate(0deg)'
          }
        }, 150)
      }
    } else {
      hideWidget()

      if (launcherContainer) {
        launcherContainer.style.transform = 'rotate(90deg)'
        setTimeout(() => {
          if (launcherContainer) {
            launcherContainer.innerHTML = launcherIcon
            launcherContainer.style.transform = 'rotate(0deg)'
          }
        }, 150)
      }
    }
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
      bottom: '100px',
      right: '20px',
      width: '380px',
      maxWidth: 'calc(100vw - 40px)',
      height: '520px',
      maxHeight: 'calc(100vh - 120px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      background: `linear-gradient(135deg, ${themeStyles.background}ee, ${themeStyles.background}f5)`,
      color: themeStyles.text,
      boxShadow: '0 24px 48px rgba(0,0,0,0.1), 0 12px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.05)',
      display: 'none',
      zIndex: '9998',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      lineHeight: '1.4',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    })

    // Apply positioning
    const position = backendConfig.position || configPosition
    if (position.includes('bottom')) container.style.bottom = '100px'
    if (position.includes('top')) container.style.top = '100px'
    if (position.includes('right')) container.style.right = '20px'
    if (position.includes('left')) container.style.left = '20px'

    // Create Preact render target
    const widgetConfig = {
      ...transformWidgetConfig(backendConfig),
      widgetKey: publicKey
    }
    
    const handleSubmit = async (data: FeedbackData) => {
      // Submit feedback via API with retry logic      
      async function submitWithRetry(retries = 2): Promise<void> {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch(`${apiBaseUrl}/public/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widgetKey: publicKey,
              response: data.response,
              rating: data.rating,
              feedbackType: data.feedbackType.toLowerCase(),
              // Include type-specific data
              ...data.typeSpecificData || {},
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
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
              } else if (status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.')
              } else if (status >= 500) {
                // Server errors should be retried
                if (retries > 0) {
                  console.warn(`Server error (${status}), retrying... (${retries} attempts left)`)
                  await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for server errors
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
              await new Promise(resolve => setTimeout(resolve, 1000))
              return submitWithRetry(retries - 1)
            }
            throw new Error('Network error. Please check your internet connection.')
          }
          
          // Generic retry logic for other errors
          if (retries > 0) {
            console.warn(`Feedback submission failed, retrying... (${retries} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 1000))
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
            launcherContainer.innerHTML = launcherIcon
            launcherContainer.style.transform = 'rotate(0deg)'
          }
        }, 150)
      }
    }

    render(
      <WidgetCore
        config={widgetConfig}
        mode="production"
        onSubmit={handleSubmit}
        onClose={handleClose}
      />,
      container
    )

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
    const primaryColor = theme.primary || '#3b82f6'
    const darkerColor = adjustColorBrightness(primaryColor, -20)

    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      cursor: 'pointer',
      background: `linear-gradient(135deg, ${primaryColor}, ${darkerColor})`,
      height: '68px',
      width: '68px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 6px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      border: '2px solid rgba(255,255,255,0.2)',
      color: '#FFFFFF',
      animation: 'reflect-pulse 3s infinite',
    })

    launcherContainer.onmouseover = () => {
      if (launcherContainer) {
        launcherContainer.style.transform = 'scale(1.1) translateY(-2px)'
        launcherContainer.style.boxShadow =
          '0 12px 35px rgba(0,0,0,0.25), 0 6px 15px rgba(0,0,0,0.15)'
        launcherContainer.style.animation = 'none'
      }
    }
    launcherContainer.onmouseout = () => {
      if (launcherContainer) {
        launcherContainer.style.transform = 'scale(1) translateY(0)'
        launcherContainer.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1)'
        launcherContainer.style.animation = 'reflect-pulse 2s infinite'
      }
    }

    launcherContainer.onmousedown = () => {
      if (launcherContainer) {
        launcherContainer.style.transform = 'scale(0.95) translateY(0)'
      }
    }
    launcherContainer.onmouseup = () => {
      if (launcherContainer) {
        launcherContainer.style.transform = 'scale(1.1) translateY(-2px)'
      }
    }

    // Apply position from config
    const position = config.position || configPosition
    if (position.includes('bottom')) launcherContainer.style.bottom = '20px'
    if (position.includes('top')) launcherContainer.style.top = '20px'
    if (position.includes('right')) launcherContainer.style.right = '20px'
    if (position.includes('left')) launcherContainer.style.left = '20px'

    launcherContainer.innerHTML = launcherIcon

    document.body.appendChild(launcherContainer)
  }

  function renderFallbackLauncher() {
    // Minimal fallback widget when config fails to load
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher-fallback'
    launcherContainer.className = 'reflect-widget-launcher'
    launcherContainer.onclick = () => {
      alert('Widget temporarily unavailable. Please refresh the page or try again later.')
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
      bottom: '20px',
      right: '20px',
    })

    launcherContainer.innerHTML = '⚠️'
    launcherContainer.title = 'Widget Error - Click for details'

    document.body.appendChild(launcherContainer)
  }
})()