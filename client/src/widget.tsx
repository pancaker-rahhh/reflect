import { createRoot } from 'react-dom/client'
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
  let reactRoot: ReturnType<typeof createRoot> | null = null

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
          transform: translateY(100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes reflect-slideDown {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(100%);
        }
      }

      .reflect-widget-container {
        animation: reflect-slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .reflect-widget-container.closing {
        animation: reflect-slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  const isDevelopment =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'

  const apiUrl = `${apiBaseUrl}/api/v1/public/widgets/${publicKey}`

  injectWidgetStyles()

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Widget configuration not found. Status: ${response.status}`)
      }
      return response.json()
    })
    .then((config: WidgetConfig) => {
      renderLauncher(config)
    })
    .catch((error) => {
      console.error('Reflect Widget: Failed to load.', error)
    })

  // Convert backend config to WidgetConfiguration format
  function transformWidgetConfig(backendConfig: WidgetConfig): WidgetConfiguration {
    const theme = backendConfig.theme_configuration || {}
    const content = backendConfig.configuration?.content || {}
    const modules = backendConfig.configuration?.modules || {}
    
    return {
      modules: {
        feedback: modules.feedback ?? true,
        reviews: modules.reviews ?? false,
        bugReporting: modules.bugReporting ?? false,
        featureRequests: modules.featureRequests ?? false,
      },
      primaryType: (backendConfig.widget_type?.toUpperCase() || 'FEEDBACK') as FeedbackType,
      content: {
        headerTitle: content.headerTitle || 'We value your feedback',
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

  function getDefaultQuestionForType(type?: string) {
    switch (type) {
      case 'nps':
        return 'How likely are you to recommend us to a friend or colleague?'
      case 'csat':
        return 'How satisfied are you with our service?'
      case 'ces':
        return 'How easy was it to use our service?'
      default:
        return 'How can we improve?'
    }
  }

  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen
    if (isWidgetOpen) {
      if (!widgetContainer) {
        // Fetch fresh widget config and render React component
        fetch(apiUrl)
          .then((response) => response.json())
          .then((config: WidgetConfig) => {
            widgetContainer = createWidgetContainer(config)
            document.body.appendChild(widgetContainer)
            showWidget()
          })
          .catch((error) => {
            console.error('Failed to load widget config:', error)
          })
      } else {
        showWidget()
      }

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
      width: '400px',
      height: '500px',
      border: 'none',
      borderRadius: '20px',
      background: themeStyles.background,
      color: themeStyles.text,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)',
      display: 'none',
      zIndex: '9998',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
    })

    // Apply positioning
    const position = backendConfig.position || configPosition
    if (position.includes('bottom')) container.style.bottom = '100px'
    if (position.includes('top')) container.style.top = '100px'
    if (position.includes('right')) container.style.right = '20px'
    if (position.includes('left')) container.style.left = '20px'

    // Create React root and render WidgetCore
    reactRoot = createRoot(container)
    
    const widgetConfig = transformWidgetConfig(backendConfig)
    
    const handleSubmit = async (data: FeedbackData) => {
      // Submit feedback via API
      const isDevelopment =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'
      
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetKey: publicKey,
            response: data.response,
            rating: data.rating,
            feedbackType: data.feedbackType.toLowerCase(),
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit feedback')
        }
      } catch (error) {
        console.error('Error submitting feedback:', error)
        throw error
      }
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

    reactRoot.render(
      <WidgetCore
        config={widgetConfig}
        mode="production"
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
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
    launcherContainer.onclick = toggleWidget

    const theme = config.theme_configuration || {}
    const primaryColor = theme.primary || '#3b82f6'
    const darkerColor = adjustColorBrightness(primaryColor, -20)

    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      cursor: 'pointer',
      background: `linear-gradient(135deg, ${primaryColor}, ${darkerColor})`,
      height: '64px',
      width: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      color: '#FFFFFF',
      animation: 'reflect-pulse 2s infinite',
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
})()