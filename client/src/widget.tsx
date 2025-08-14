interface ReflectConfig {
  key: string
}

declare global {
  interface Window {
    reflectConfig: ReflectConfig
  }
}

;(function () {
  let isWidgetOpen = false
  let iframe: HTMLIFrameElement | null = null
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

      #reflect-widget-iframe {
        animation: reflect-slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #reflect-widget-iframe.closing {
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

  // Use environment-based URLs
  const isDevelopment =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'
  const appBaseUrl = isDevelopment ? 'http://localhost:5173' : 'https://app.reflect.com'

  const widgetAppUrl = `${appBaseUrl}/widget-view?key=${publicKey}`
  const apiUrl = `${apiBaseUrl}/api/v1/public/widgets/${publicKey}`

  injectWidgetStyles()

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Widget configuration not found. Status: ${response.status}`)
      }
      return response.json()
    })
    .then((config) => {
      renderLauncher(config)
    })
    .catch((error) => {
      console.error('Reflect Widget: Failed to load.', error)
    })

  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen
    if (isWidgetOpen) {
      if (!iframe) {
        iframe = createWidgetIframe()
        document.body.appendChild(iframe)
      }

      iframe.style.display = 'block'
      iframe.classList.remove('closing')

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
      if (iframe) {
        iframe.classList.add('closing')
        setTimeout(() => {
          if (iframe) {
            iframe.style.display = 'none'
            iframe.classList.remove('closing')
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

  /**
   * Creates the iframe element that will host the main widget application.
   * @returns {HTMLIFrameElement} The created iframe element.
   */
  function createWidgetIframe(): HTMLIFrameElement {
    const iframeEl = document.createElement('iframe')
    iframeEl.id = 'reflect-widget-iframe'
    iframeEl.src = widgetAppUrl

    Object.assign(iframeEl.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '380px',
      height: '520px',
      border: 'none',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow:
        '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
      display: 'none',
      zIndex: '9998',
      overflow: 'hidden',
    })

    return iframeEl
  }

  /**
   * Renders the widget launcher button on the page.
   * @param {any} config The widget configuration from the API.
   */
  function renderLauncher(config: any) {
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher'
    launcherContainer.onclick = toggleWidget

    const theme = config.theme_configuration || {}
    const primaryColor = theme.primary || '#6B46C1'

    // Create gradient colors
    const lighterColor = adjustColorBrightness(primaryColor, 20)
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
        launcherContainer.style.animation = 'none' // Stop pulse on hover
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

    const position = config.position || 'bottom_right'
    if (position.includes('bottom')) launcherContainer.style.bottom = '20px'
    if (position.includes('top')) launcherContainer.style.top = '20px'
    if (position.includes('right')) launcherContainer.style.right = '20px'
    if (position.includes('left')) launcherContainer.style.left = '20px'

    launcherContainer.innerHTML = launcherIcon

    document.body.appendChild(launcherContainer)
  }
})()
