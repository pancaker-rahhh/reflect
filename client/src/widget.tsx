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
  }
  position?: string
  modules?: {
    nps?: boolean
    csat?: boolean
    ces?: boolean
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
    const styleId = 'reflect-widget-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes reflect-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
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
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen
    if (isWidgetOpen) {
      if (!widgetContainer) {
        widgetContainer = createWidgetContainer()
        document.body.appendChild(widgetContainer)
      }

      widgetContainer.style.display = 'block'
      widgetContainer.classList.remove('closing')

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
      if (widgetContainer) {
        widgetContainer.classList.add('closing')
        setTimeout(() => {
          if (widgetContainer) {
            widgetContainer.style.display = 'none'
            widgetContainer.classList.remove('closing')
          }
        }, 300)
      }

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

  function createWidgetContainer(): HTMLDivElement {
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

    // Add widget content
    container.innerHTML = createWidgetContent(theme)

    // Add close button
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = closeIcon
    closeBtn.onclick = toggleWidget
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: themeStyles.text,
      transition: 'background-color 0.2s',
    })

    closeBtn.onmouseover = () => {
      closeBtn.style.backgroundColor = themeStyles.hoverBackground
    }
    closeBtn.onmouseout = () => {
      closeBtn.style.backgroundColor = 'transparent'
    }

    container.appendChild(closeBtn)

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

  function createWidgetContent(theme: string): string {
    const themeStyles = getThemeStyles(theme)

    return `
      <div style="padding: 20px; height: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; color: ${themeStyles.text}; font-size: 24px; font-weight: 600;">
            How was your experience?
          </h2>
          <p style="margin: 0; color: ${themeStyles.secondary}; font-size: 16px;">
            We'd love to hear your feedback
          </p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <button class="feedback-type-btn" data-type="nps" style="
            padding: 15px 20px;
            background: ${themeStyles.primary};
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          ">
            <div style="font-weight: 600; margin-bottom: 5px;">NPS Survey</div>
            <div style="font-size: 14px; opacity: 0.9;">Rate your likelihood to recommend</div>
          </button>
          
          <button class="feedback-type-btn" data-type="csat" style="
            padding: 15px 20px;
            background: ${themeStyles.primary};
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          ">
            <div style="font-weight: 600; margin-bottom: 5px;">Customer Satisfaction</div>
            <div style="font-size: 14px; opacity: 0.9;">How satisfied are you with our service?</div>
          </button>
          
          <button class="feedback-type-btn" data-type="ces" style="
            padding: 15px 20px;
            background: ${themeStyles.primary};
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          ">
            <div style="font-weight: 600; margin-bottom: 5px;">Customer Effort Score</div>
            <div style="font-size: 14px; opacity: 0.9;">How easy was it to get help?</div>
          </button>
        </div>
      </div>
    `
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
